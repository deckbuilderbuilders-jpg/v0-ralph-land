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

// Generate a dynamic todo list from PRD analysis
export function generateTodoFromPRD(prd: string, totalIterations: number): TodoItem[] {
  const todos: TodoItem[] = []

  // Core tasks based on iterations
  const taskTemplates = [
    { id: "setup", task: "Project setup - layout, globals, config files" },
    { id: "ui-components", task: "Build reusable UI components (buttons, cards, inputs)" },
    { id: "page-structure", task: "Create page layouts and navigation" },
    { id: "features", task: "Implement core features and interactivity" },
    { id: "data-layer", task: "Add API routes and data handling" },
  ]

  // Add detected features as tasks
  const prdLower = prd.toLowerCase()

  if (prdLower.includes("auth") || prdLower.includes("login") || prdLower.includes("sign")) {
    taskTemplates.push({ id: "auth", task: "Implement authentication system" })
  }

  if (prdLower.includes("database") || prdLower.includes("crud") || prdLower.includes("store")) {
    taskTemplates.push({ id: "database", task: "Set up database integration" })
  }

  if (prdLower.includes("payment") || prdLower.includes("stripe") || prdLower.includes("checkout")) {
    taskTemplates.push({ id: "payments", task: "Integrate payment processing" })
  }

  if (prdLower.includes("upload") || prdLower.includes("file") || prdLower.includes("image")) {
    taskTemplates.push({ id: "uploads", task: "Add file upload functionality" })
  }

  taskTemplates.push({ id: "testing", task: "Test and verify all components" })
  taskTemplates.push({ id: "polish", task: "Final polish and optimization" })

  // Map to iterations
  taskTemplates.forEach((template, index) => {
    todos.push({
      id: template.id,
      task: template.task,
      status: "pending",
      iteration: Math.min(index + 1, totalIterations),
    })
  })

  return todos
}

// Format build context for Claude prompt injection
export function formatContextForPrompt(context: BuildContext): string {
  const { prd, todoList, progress, iterationHistory } = context

  const prompt = `=== CURRENT BUILD CONTEXT ===

## Project PRD
${prd}

## Build Progress
- Current Iteration: ${progress.currentIteration} of ${progress.totalIterations}
- Phase: ${progress.phase}
- Files Generated: ${progress.filesGenerated}
- Lines of Code: ${progress.linesOfCode}

## Todo List
${todoList
  .map((item) => {
    const statusIcon = item.status === "completed" ? "[x]" : item.status === "in-progress" ? "[>]" : "[ ]"
    return `${statusIcon} ${item.task}${item.testResult ? ` (Test: ${item.testResult.passed ? "PASS" : "FAIL"})` : ""}`
  })
  .join("\n")}

## Completed Work (Previous Iterations)
${iterationHistory
  .map(
    (iter) => `
### Iteration ${iter.iteration}
- Files: ${iter.filesCreated.join(", ") || "none"}
- Summary: ${iter.summary}
${iter.testResult ? `- Test: ${iter.testResult.passed ? "PASSED" : "FAILED - " + iter.testResult.errors.join(", ")}` : ""}
`,
  )
  .join("\n")}

=== END CONTEXT ===
`

  return prompt
}

// Generate iteration summary for PRD update
export function generateIterationSummary(iteration: number, filesCreated: string[], testResult?: TestResult): string {
  const summary = `
## Iteration ${iteration} Summary
- Files Created/Updated: ${filesCreated.length}
${filesCreated.map((f) => `  - ${f}`).join("\n")}
- Test Status: ${testResult ? (testResult.passed ? "PASSED" : "FAILED") : "Not tested"}
${testResult?.errors.length ? `- Errors: ${testResult.errors.join(", ")}` : ""}
- Completed: ${new Date().toISOString()}
`
  return summary
}
