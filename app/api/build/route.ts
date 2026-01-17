import type { NextRequest } from "next/server"
import { streamText } from "ai"
import { stripe } from "@/lib/stripe"
import { formatContextForPrompt, generateTodoFromPRD, type BuildContext, type BuildProgress } from "@/lib/build-context"

export const maxDuration = 300 // 5 minutes for enterprise apps

export async function POST(request: NextRequest) {
  try {
    const {
      prd,
      iteration,
      totalIterations,
      previousFiles,
      sessionId,
      buildContext: existingContext,
      githubConfig,
      isRetry = false,
      lastError,
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

    // Update progress
    buildContext.progress.currentIteration = iteration
    buildContext.progress.phase = getPhaseForIteration(iteration)

    const currentTodo = buildContext.todoList.find((t) => t.iteration === iteration)
    if (currentTodo) {
      currentTodo.status = "in-progress"
      buildContext.progress.currentTask = currentTodo.task
    }

    const contextPrompt = formatContextForPrompt(buildContext, {
      maxPreviousFiles: iteration > 5 ? 10 : 20, // Fewer files in context for later iterations
      truncateContent: iteration > 7, // Truncate file content for final iterations
    })

    const iterationFocus = getIterationFocus(iteration, totalIterations)

    const retryContext =
      isRetry && lastError
        ? `\n\nPREVIOUS ATTEMPT FAILED WITH ERROR:\n${lastError}\n\nPlease fix the issue and try again. Focus on generating valid, complete code.\n`
        : ""

    const systemPrompt = `You are an expert Next.js 14+ developer building a production web application.
You write clean, type-safe TypeScript code using modern best practices.

${contextPrompt}
${retryContext}

OUTPUT FORMAT - CRITICAL:
You MUST output each file using this EXACT format:

=== FILE: path/to/file.tsx ===
// file content here - COMPLETE CODE, NO PLACEHOLDERS
=== END FILE ===

AFTER generating ALL files, output a progress update:

=== PROGRESS UPDATE ===
{
  "iteration": ${iteration},
  "filesCreated": ["list", "of", "files"],
  "summary": "Brief description of what was accomplished",
  "nextSteps": ["what", "to", "do", "next"],
  "todoUpdates": [{ "id": "task-id", "status": "completed" }]
}
=== END PROGRESS ===

CRITICAL RULES:
1. Use === FILE: path === and === END FILE === markers EXACTLY as shown
2. Write COMPLETE, WORKING code - NO placeholders, NO "// TODO", NO "..."
3. Use TypeScript with proper types - avoid 'any' unless absolutely necessary
4. Use Tailwind CSS for ALL styling - no inline styles, no CSS modules
5. Follow Next.js 14 App Router conventions (app directory, server components by default)
6. Import shadcn components from @/components/ui/*
7. Add 'use client' directive ONLY when using hooks or browser APIs
8. Handle errors properly - try/catch, error boundaries
9. Make forms accessible - labels, aria attributes, proper validation
10. Reference previous iteration work - don't duplicate, BUILD UPON IT

${
  previousFiles && previousFiles.length > 0
    ? `
EXISTING FILES (reference or update these - DO NOT recreate from scratch):
${previousFiles
  .slice(0, 15)
  .map((f: { path: string }) => `- ${f.path}`)
  .join("\n")}
${previousFiles.length > 15 ? `\n... and ${previousFiles.length - 15} more files` : ""}
`
    : ""
}

This is iteration ${iteration} of ${totalIterations}.
FOCUS THIS ITERATION ON: ${iterationFocus}`

    const result = streamText({
      model: "anthropic/claude-sonnet-4",
      system: systemPrompt,
      prompt: `Build iteration ${iteration}. Focus: ${iterationFocus}

Generate the code now. Remember:
- Use === FILE: path === and === END FILE === markers
- Write complete, working code
- Include the PROGRESS UPDATE at the end`,
      maxTokens: 16000, // Increased for complex apps
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Build error:", error)
    return new Response(
      JSON.stringify({
        error: "Build failed",
        details: error instanceof Error ? error.message : "Unknown error",
        retryable: true,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
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
  const percentage = iteration / total

  if (percentage <= 0.1) {
    return `Project foundation:
- app/layout.tsx with metadata, fonts, and providers
- app/page.tsx with initial structure
- app/globals.css with Tailwind + CSS variables for theming
- lib/utils.ts with cn() helper
- components/ui/button.tsx (if not using shadcn)`
  }

  if (percentage <= 0.25) {
    return `Core UI components and layout:
- Navigation component (header/navbar)
- Footer component
- Reusable card, input, and form components
- Loading skeletons and error states`
  }

  if (percentage <= 0.4) {
    return `Page structure and routing:
- All main page routes
- Dynamic route handling if needed
- Page sections and content areas
- Responsive layout structure`
  }

  if (percentage <= 0.6) {
    return `Feature implementation:
- Form handling with validation (react-hook-form + zod)
- State management
- User interactions and event handlers
- Modals, dropdowns, and overlays`
  }

  if (percentage <= 0.75) {
    return `API and data layer:
- API routes in app/api/
- Server actions for mutations
- Data fetching patterns
- Error handling and loading states`
  }

  if (percentage <= 0.9) {
    return `Authentication and integrations:
- Auth flow (if required by PRD)
- Third-party integrations
- Protected routes
- User session handling`
  }

  return `Final polish and testing:
- Review all components for bugs
- Ensure responsive design works
- Add missing accessibility features
- Optimize performance
- Final code cleanup`
}
