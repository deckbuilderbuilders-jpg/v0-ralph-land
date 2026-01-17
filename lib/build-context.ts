// Build context management - tracks PRD, todo list, progress, and test results

export interface TodoItem {
  id: string
  task: string
  status: "pending" | "in-progress" | "completed" | "failed"
  iteration?: number
  files?: string[]
  testResult?: TestResult
}

export interface TestResult {
  passed: boolean
  errors: string[]
  warnings: string[]
  testedAt: Date
}

export interface BuildProgress {
  currentIteration: number
  totalIterations: number
  phase: "setup" | "components" | "pages" | "features" | "api" | "testing" | "complete"
  completedTasks: string[]
  currentTask: string
  filesGenerated: number
  linesOfCode: number
  lastTestResult?: TestResult
  githubSyncedAt?: Date
  githubCommitSha?: string
}

export interface BuildContext {
  prd: string
  todoList: TodoItem[]
  progress: BuildProgress
  iterationHistory: IterationResult[]
}

export interface IterationResult {
  iteration: number
  filesCreated: string[]
  filesUpdated: string[]
  testResult?: TestResult
  summary: string
  timestamp: Date
}

interface FormatOptions {
  maxPreviousFiles?: number
  truncateContent?: boolean
  maxPrdLength?: number
}

// Generate a dynamic todo list from PRD analysis
export function generateTodoFromPRD(prd: string, totalIterations: number): TodoItem[] {
  const todos: TodoItem[] = []
  const prdLower = prd.toLowerCase()

  // Core tasks
  const taskTemplates = [
    { id: "setup", task: "Project setup - layout, globals, config files" },
    { id: "ui-components", task: "Build reusable UI components" },
    { id: "page-structure", task: "Create page layouts and navigation" },
    { id: "features", task: "Implement core features and interactivity" },
    { id: "data-layer", task: "Add API routes and data handling" },
  ]

  // Detect features
  if (/\b(auth|login|signup|sign.?up|sign.?in|password|oauth|session)\b/i.test(prd)) {
    taskTemplates.push({ id: "auth", task: "Implement authentication system" })
  }

  if (/\b(database|db|storage|persist|crud|sql|postgres|supabase|firebase|prisma)\b/i.test(prd)) {
    taskTemplates.push({ id: "database", task: "Set up database integration" })
  }

  if (/\b(payment|stripe|checkout|subscription|billing|purchase|cart|e.?commerce)\b/i.test(prd)) {
    taskTemplates.push({ id: "payments", task: "Integrate payment processing" })
  }

  if (/\b(upload|file|image|media|attachment|s3|blob)\b/i.test(prd)) {
    taskTemplates.push({ id: "uploads", task: "Add file upload functionality" })
  }

  if (/\b(realtime|real.?time|websocket|live|chat|notification)\b/i.test(prd)) {
    taskTemplates.push({ id: "realtime", task: "Implement real-time features" })
  }

  if (/\b(dashboard|admin|analytics|metrics|chart|graph)\b/i.test(prd)) {
    taskTemplates.push({ id: "dashboard", task: "Build dashboard and analytics" })
  }

  taskTemplates.push({ id: "testing", task: "Test and verify all components" })
  taskTemplates.push({ id: "polish", task: "Final polish and optimization" })

  // Map to iterations
  const iterationsPerTask = Math.max(1, Math.floor(totalIterations / taskTemplates.length))

  taskTemplates.forEach((template, index) => {
    const iteration = Math.min(index * iterationsPerTask + 1, totalIterations)
    todos.push({
      id: template.id,
      task: template.task,
      status: "pending",
      iteration,
    })
  })

  return todos
}

export function formatContextForPrompt(context: BuildContext, options: FormatOptions = {}): string {
  const { maxPreviousFiles = 20, truncateContent = false, maxPrdLength = 4000 } = options

  const { prd, todoList, progress, iterationHistory } = context

  // Truncate PRD if too long
  const truncatedPrd =
    prd.length > maxPrdLength ? prd.slice(0, maxPrdLength) + "\n\n[PRD truncated for context limits...]" : prd

  // Format iteration history (limit to last few)
  const recentHistory = iterationHistory.slice(-5)
  const historyStr = recentHistory
    .map(
      (iter) => `
### Iteration ${iter.iteration}
- Files: ${iter.filesCreated.slice(0, 10).join(", ")}${iter.filesCreated.length > 10 ? ` (+${iter.filesCreated.length - 10} more)` : ""}
- Summary: ${iter.summary}
${iter.testResult ? `- Test: ${iter.testResult.passed ? "PASSED" : "FAILED"}` : ""}
`,
    )
    .join("\n")

  const prompt = `=== CURRENT BUILD CONTEXT ===

## Project PRD
${truncatedPrd}

## Build Progress
- Current Iteration: ${progress.currentIteration} of ${progress.totalIterations}
- Phase: ${progress.phase}
- Files Generated: ${progress.filesGenerated}

## Todo List
${todoList
  .map((item) => {
    const icon = item.status === "completed" ? "[x]" : item.status === "in-progress" ? "[>]" : "[ ]"
    return `${icon} ${item.task}`
  })
  .join("\n")}

## Previous Iterations
${historyStr || "No previous iterations yet."}

=== END CONTEXT ===
`

  return prompt
}

export function generateIterationSummary(iteration: number, filesCreated: string[], testResult?: TestResult): string {
  return `
## Iteration ${iteration} Summary
- Files: ${filesCreated.length}
- Test: ${testResult ? (testResult.passed ? "PASSED" : "FAILED") : "Not tested"}
- Completed: ${new Date().toISOString()}
`
}
