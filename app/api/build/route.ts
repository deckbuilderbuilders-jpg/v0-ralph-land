import type { NextRequest } from "next/server"
import { streamText } from "ai"
import { stripe } from "@/lib/stripe"
import { formatContextForPrompt, generateTodoFromPRD, type BuildContext, type BuildProgress } from "@/lib/build-context"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const {
      prd,
      iteration,
      totalIterations,
      previousFiles,
      sessionId,
      buildContext: existingContext,
      githubConfig, // Optional: { token, repoName, owner }
    } = await request.json()

    // Verify payment
    if (sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        if (session.payment_status !== "paid") {
          return new Response(JSON.stringify({ error: "Payment not completed" }), {
            status: 402,
            headers: { "Content-Type": "application/json" },
          })
        }
      } catch (err) {
        console.error("Payment verification error:", err)
        return new Response(JSON.stringify({ error: "Invalid payment session" }), {
          status: 402,
          headers: { "Content-Type": "application/json" },
        })
      }
    } else {
      return new Response(JSON.stringify({ error: "Payment session required" }), {
        status: 402,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Initialize or restore build context
    const buildContext: BuildContext = existingContext || {
      prd,
      todoList: generateTodoFromPRD(prd, totalIterations),
      progress: {
        currentIteration: iteration,
        totalIterations,
        phase: getPhaseForIteration(iteration),
        completedTasks: [],
        currentTask: "",
        filesGenerated: previousFiles?.length || 0,
        linesOfCode: 0,
      },
      iterationHistory: [],
    }

    // Update progress for current iteration
    buildContext.progress.currentIteration = iteration
    buildContext.progress.phase = getPhaseForIteration(iteration)

    // Mark current task as in-progress
    const currentTodo = buildContext.todoList.find((t) => t.iteration === iteration)
    if (currentTodo) {
      currentTodo.status = "in-progress"
      buildContext.progress.currentTask = currentTodo.task
    }

    // Build the enhanced prompt with full context
    const contextPrompt = formatContextForPrompt(buildContext)

    const iterationFocus = getIterationFocus(iteration, totalIterations)

    const systemPrompt = `You are an expert Next.js developer building a production web application.

${contextPrompt}

OUTPUT FORMAT - CRITICAL:
You MUST output each file using this exact format:

=== FILE: path/to/file.tsx ===
// file content here
=== END FILE ===

AFTER generating files, you MUST output a progress update:

=== PROGRESS UPDATE ===
{
  "iteration": ${iteration},
  "filesCreated": ["list", "of", "files"],
  "summary": "Brief description of what was accomplished",
  "nextSteps": ["what", "to", "do", "next"],
  "todoUpdates": [
    { "id": "task-id", "status": "completed" }
  ],
  "prdAddendum": "Any notes to add to the PRD based on implementation decisions"
}
=== END PROGRESS ===

RULES:
1. Use === FILE: path === to start each file
2. Use === END FILE === to end each file  
3. Write COMPLETE, WORKING code - no placeholders, no "// TODO", no "..."
4. Use TypeScript with proper types
5. Use Tailwind CSS for all styling
6. Follow Next.js 14+ App Router conventions
7. Import shadcn components from @/components/ui
8. ALWAYS include the PROGRESS UPDATE at the end
9. Reference previous iteration work - don't duplicate, build upon it
10. If you find issues with previous code, fix them and note in progress update

This is iteration ${iteration} of ${totalIterations}.
FOCUS ON: ${iterationFocus}

${
  previousFiles && previousFiles.length > 0
    ? `\nEXISTING FILES (you can reference or update these):\n${previousFiles.map((f: { path: string }) => `- ${f.path}`).join("\n")}`
    : ""
}`

    const result = streamText({
      model: "anthropic/claude-sonnet-4",
      system: systemPrompt,
      prompt: `Build iteration ${iteration} of the application. Focus on: ${iterationFocus}

Remember to:
1. Check the todo list and mark completed items
2. Reference previous iteration work
3. Write complete, testable code
4. Include the PROGRESS UPDATE at the end`,
      maxTokens: 12000,
    })

    // Return stream - the client will parse files and progress
    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Build error:", error)
    return new Response(JSON.stringify({ error: "Build failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

function getPhaseForIteration(iteration: number): BuildProgress["phase"] {
  if (iteration === 1) return "setup"
  if (iteration <= 3) return "components"
  if (iteration <= 5) return "pages"
  if (iteration <= 7) return "features"
  if (iteration <= 9) return "api"
  return "testing"
}

function getIterationFocus(iteration: number, total: number): string {
  const focusMap: Record<number, string> = {
    1: `Project foundation:
- app/layout.tsx with metadata, fonts, and theme setup
- app/page.tsx with initial page structure
- app/globals.css with Tailwind configuration
- Any config files needed (tailwind.config.ts, etc.)`,

    2: `Core UI components:
- components/ui/button.tsx (if custom needed beyond shadcn)
- components/ui/card.tsx
- components/ui/input.tsx  
- Any other reusable UI primitives
- Ensure all components are properly typed`,

    3: `Page layouts and navigation:
- Header/navbar component with navigation
- Footer component
- Sidebar (if needed)
- Page section components
- Responsive layout structure`,

    4: `Feature implementation - Part 1:
- Form components with validation (react-hook-form + zod)
- State management setup
- Event handlers and interactivity
- Loading and error states`,

    5: `Feature implementation - Part 2:
- Complex UI interactions
- Modals, dropdowns, tooltips
- Animations (framer-motion if needed)
- Data display components (tables, lists, cards)`,

    6: `API and data layer:
- API routes in app/api/
- Server actions for mutations
- Data fetching with proper caching
- Error handling middleware`,

    7: `Authentication (if required):
- Auth components (login, register, forgot password)
- Protected route handling
- Session/token management
- User profile components`,

    8: `Integrations and advanced features:
- Third-party API integrations
- Payment processing (if needed)
- File uploads (if needed)
- Real-time features (if needed)`,

    9: `Testing and refinement:
- Review all components for bugs
- Fix any type errors
- Ensure responsive design works
- Accessibility improvements (aria labels, keyboard nav)`,

    10: `Final polish:
- Performance optimization
- SEO metadata
- Final styling tweaks  
- Code cleanup and comments`,
  }

  return focusMap[Math.min(iteration, 10)] || focusMap[10]
}
