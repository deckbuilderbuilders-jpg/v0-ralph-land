/**
 * File Parser Utility
 * Parses Claude's code output into discrete file objects
 */

export interface GeneratedFile {
  path: string
  content: string
  language: string
}

/**
 * Parse Claude's output that uses === FILE: path === markers
 */
export function parseGeneratedCode(raw: string): GeneratedFile[] {
  const files: GeneratedFile[] = []

  // Match file blocks with === FILE: path === markers
  const fileRegex = /=== FILE: ([^\s]+) ===([\s\S]*?)(?==== FILE:|$)/g
  let match

  while ((match = fileRegex.exec(raw)) !== null) {
    const path = match[1].trim()
    const content = match[2].trim()

    if (path && content) {
      files.push({
        path,
        content,
        language: getLanguageFromPath(path),
      })
    }
  }

  // If no files found with markers, try JSON format
  if (files.length === 0) {
    try {
      const jsonMatch = raw.match(/\{[\s\S]*"files"[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed.files)) {
          return parsed.files.map((f: { path: string; content: string }) => ({
            path: f.path,
            content: f.content,
            language: getLanguageFromPath(f.path),
          }))
        }
      }
    } catch {
      // Not JSON format, continue
    }
  }

  // If still no files, try code block format ```lang file="path"
  if (files.length === 0) {
    const codeBlockRegex = /```(\w+)?\s*file="([^"]+)"([\s\S]*?)```/g
    while ((match = codeBlockRegex.exec(raw)) !== null) {
      const language = match[1] || "text"
      const path = match[2].trim()
      const content = match[3].trim()

      if (path && content) {
        files.push({ path, content, language })
      }
    }
  }

  return files
}

/**
 * Merge files from multiple iterations, later files override earlier ones
 */
export function mergeGeneratedFiles(existing: GeneratedFile[], newFiles: GeneratedFile[]): GeneratedFile[] {
  const fileMap = new Map<string, GeneratedFile>()

  // Add existing files
  for (const file of existing) {
    fileMap.set(file.path, file)
  }

  // Override/add new files
  for (const file of newFiles) {
    fileMap.set(file.path, file)
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
    json: "json",
    md: "markdown",
    html: "html",
    sql: "sql",
    py: "python",
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

  return {
    fileCount: files.length,
    totalLines,
    totalChars,
    byType,
  }
}
