/**
 * File Parser Utility
 * Parses Claude's code output into discrete file objects
 * Enhanced to handle complex apps with edge cases
 */

export interface GeneratedFile {
  path: string
  content: string
  language: string
  iteration?: number
}

/**
 * Parse Claude's output that uses === FILE: path === markers
 * Enhanced with better error handling and edge case support
 */
export function parseGeneratedCode(raw: string, iteration?: number): GeneratedFile[] {
  const files: GeneratedFile[] = []

  // Normalize line endings
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  // Method 1: Match file blocks with === FILE: path === ... === END FILE === markers
  const fileRegexWithEnd = /=== FILE: ([^\s=]+) ===([\s\S]*?)=== END FILE ===/g
  let match
  let foundWithEnd = false

  while ((match = fileRegexWithEnd.exec(normalized)) !== null) {
    foundWithEnd = true
    const path = match[1].trim()
    let content = match[2].trim()

    // Remove any leading/trailing code fence markers
    content = content.replace(/^```\w*\n?/, "").replace(/\n?```$/, "")

    if (path && content) {
      files.push({
        path: sanitizePath(path),
        content: cleanContent(content),
        language: getLanguageFromPath(path),
        iteration,
      })
    }
  }

  // Method 2: If END FILE not found, use next FILE marker or end of string
  if (!foundWithEnd) {
    const fileRegexNoEnd = /=== FILE: ([^\s=]+) ===([\s\S]*?)(?==== FILE:|=== PROGRESS|$)/g
    while ((match = fileRegexNoEnd.exec(normalized)) !== null) {
      const path = match[1].trim()
      let content = match[2].trim()

      content = content.replace(/^```\w*\n?/, "").replace(/\n?```$/, "")

      if (path && content && content.length > 10) {
        files.push({
          path: sanitizePath(path),
          content: cleanContent(content),
          language: getLanguageFromPath(path),
          iteration,
        })
      }
    }
  }

  // Method 3: Try code block format ```lang file="path"
  if (files.length === 0) {
    const codeBlockRegex = /```(\w+)?\s*file=["']([^"']+)["']([\s\S]*?)```/g
    while ((match = codeBlockRegex.exec(normalized)) !== null) {
      const language = match[1] || "text"
      const path = match[2].trim()
      const content = match[3].trim()

      if (path && content) {
        files.push({
          path: sanitizePath(path),
          content: cleanContent(content),
          language,
          iteration,
        })
      }
    }
  }

  // Method 4: Try JSON format as last resort
  if (files.length === 0) {
    try {
      // Look for files array in JSON
      const jsonMatch = normalized.match(/\{\s*"files"\s*:\s*\[([\s\S]*?)\]\s*\}/i)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed.files)) {
          return parsed.files.map((f: { path: string; content: string }) => ({
            path: sanitizePath(f.path),
            content: cleanContent(f.content),
            language: getLanguageFromPath(f.path),
            iteration,
          }))
        }
      }
    } catch {
      // Not valid JSON, continue
    }
  }

  return files
}

/**
 * Sanitize file path to prevent directory traversal and fix common issues
 */
function sanitizePath(path: string): string {
  return path
    .replace(/\.\./g, "") // Remove parent directory references
    .replace(/^\/+/, "") // Remove leading slashes
    .replace(/\/+/g, "/") // Normalize multiple slashes
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .trim()
}

/**
 * Clean content - remove artifacts and normalize
 */
function cleanContent(content: string): string {
  return content
    .replace(/^```\w*\n?/, "") // Remove opening code fence
    .replace(/\n?```$/, "") // Remove closing code fence
    .replace(/\r\n/g, "\n") // Normalize line endings
    .trim()
}

/**
 * Parse progress update from Claude's output
 */
export interface ProgressUpdate {
  iteration: number
  filesCreated: string[]
  summary: string
  nextSteps: string[]
  todoUpdates: Array<{ id: string; status: string }>
  prdAddendum?: string
  errors?: string[]
}

export function parseProgressUpdate(raw: string): ProgressUpdate | null {
  const match = raw.match(/=== PROGRESS UPDATE ===([\s\S]*?)=== END PROGRESS ===/i)
  if (!match) return null

  try {
    const jsonStr = match[1].trim()
    return JSON.parse(jsonStr)
  } catch {
    // Try to extract partial info
    const iterMatch = raw.match(/"iteration"\s*:\s*(\d+)/)
    const filesMatch = raw.match(/"filesCreated"\s*:\s*\[(.*?)\]/s)
    const summaryMatch = raw.match(/"summary"\s*:\s*"([^"]*)"/)

    if (iterMatch) {
      return {
        iteration: Number.parseInt(iterMatch[1]),
        filesCreated: filesMatch
          ? filesMatch[1]
              .split(",")
              .map((s) => s.replace(/["\s]/g, "").trim())
              .filter(Boolean)
          : [],
        summary: summaryMatch ? summaryMatch[1] : "Iteration completed",
        nextSteps: [],
        todoUpdates: [],
      }
    }
    return null
  }
}

/**
 * Merge files from multiple iterations with smart conflict resolution
 */
export function mergeGeneratedFiles(existing: GeneratedFile[], newFiles: GeneratedFile[]): GeneratedFile[] {
  const fileMap = new Map<string, GeneratedFile>()

  // Add existing files
  for (const file of existing) {
    fileMap.set(file.path, file)
  }

  // Override/add new files with validation
  for (const file of newFiles) {
    // Skip empty or invalid files
    if (!file.content || file.content.length < 5) continue

    // Skip files that look like error messages
    if (file.content.startsWith("Error:") || file.content.includes("I apologize")) continue

    // Check if this is a meaningful update
    const existing = fileMap.get(file.path)
    if (existing) {
      // Only update if new content is substantially different
      if (
        Math.abs(existing.content.length - file.content.length) > 50 ||
        !existing.content.includes(file.content.slice(0, 100))
      ) {
        fileMap.set(file.path, file)
      }
    } else {
      fileMap.set(file.path, file)
    }
  }

  return Array.from(fileMap.values())
}

function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    css: "css",
    scss: "scss",
    json: "json",
    md: "markdown",
    html: "html",
    sql: "sql",
    py: "python",
    env: "plaintext",
    yaml: "yaml",
    yml: "yaml",
  }
  return langMap[ext || ""] || "text"
}

/**
 * Get file statistics for display
 */
export function getFileStats(files: GeneratedFile[]) {
  const totalLines = files.reduce((sum, f) => sum + f.content.split("\n").length, 0)
  const totalChars = files.reduce((sum, f) => sum + f.content.length, 0)

  const byType: Record<string, number> = {}
  for (const file of files) {
    const ext = file.path.split(".").pop() || "other"
    byType[ext] = (byType[ext] || 0) + 1
  }

  // Calculate code quality metrics
  const issues: string[] = []
  for (const file of files) {
    if (file.content.includes("// TODO")) issues.push(`${file.path}: Contains TODO`)
    if (file.content.includes("...")) issues.push(`${file.path}: Contains placeholder ...`)
    if (file.content.match(/any\b/g)?.length || 0 > 3) issues.push(`${file.path}: Excessive 'any' types`)
  }

  return {
    fileCount: files.length,
    totalLines,
    totalChars,
    byType,
    issues,
    estimatedBytes: totalChars,
  }
}

/**
 * Validate generated files for common issues
 */
export function validateFiles(files: GeneratedFile[]): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for required files in Next.js apps
  const paths = files.map((f) => f.path)

  if (!paths.some((p) => p.includes("layout.tsx") || p.includes("layout.js"))) {
    warnings.push("Missing app/layout.tsx - may cause rendering issues")
  }

  if (!paths.some((p) => p.includes("page.tsx") || p.includes("page.js"))) {
    errors.push("Missing app/page.tsx - app will not have a homepage")
  }

  // Check for import/export issues
  for (const file of files) {
    if (file.language === "typescript") {
      // Check for default export in page/layout files
      if (file.path.includes("page.") || file.path.includes("layout.")) {
        if (!file.content.includes("export default")) {
          errors.push(`${file.path}: Missing default export`)
        }
      }

      // Check for unclosed brackets/braces (simple check)
      const opens = (file.content.match(/\{/g) || []).length
      const closes = (file.content.match(/\}/g) || []).length
      if (Math.abs(opens - closes) > 2) {
        errors.push(`${file.path}: Mismatched braces ({: ${opens}, }: ${closes})`)
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}
