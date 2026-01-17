// Code testing and validation utilities

export interface TestResult {
  passed: boolean
  errors: string[]
  warnings: string[]
  testedAt: Date
}

export interface ValidationResult {
  isValid: boolean
  syntaxErrors: string[]
  missingImports: string[]
  unusedExports: string[]
  placeholders: string[]
}

// Check for common syntax issues
export function validateSyntax(code: string, filePath: string): string[] {
  const errors: string[] = []

  // Check for mismatched brackets
  const brackets: Record<string, string> = { "{": "}", "[": "]", "(": ")" }
  const stack: string[] = []
  let inString = false
  let stringChar = ""

  for (let i = 0; i < code.length; i++) {
    const char = code[i]
    const prevChar = i > 0 ? code[i - 1] : ""

    // Handle strings
    if ((char === '"' || char === "'" || char === "`") && prevChar !== "\\") {
      if (!inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar) {
        inString = false
      }
      continue
    }

    if (inString) continue

    // Track brackets
    if (brackets[char]) {
      stack.push(brackets[char])
    } else if (Object.values(brackets).includes(char)) {
      if (stack.pop() !== char) {
        errors.push(`${filePath}: Mismatched bracket '${char}' at position ${i}`)
      }
    }
  }

  if (stack.length > 0) {
    errors.push(`${filePath}: Unclosed brackets: expected ${stack.join(", ")}`)
  }

  // Check for common issues
  if (code.includes("TODO") || code.includes("FIXME")) {
    errors.push(`${filePath}: Contains TODO/FIXME comments - incomplete code`)
  }

  if (code.includes("...") && !code.includes("...props") && !code.includes("...rest")) {
    const spreadCount = (code.match(/\.\.\./g) || []).length
    const validSpreadCount = (code.match(/\.\.\.(\w+)/g) || []).length
    if (spreadCount > validSpreadCount) {
      errors.push(`${filePath}: Contains placeholder spread operators (...)`)
    }
  }

  return errors
}

// Check for missing imports
export function validateImports(code: string, availableFiles: string[]): string[] {
  const errors: string[] = []

  // Find all imports
  const importRegex = /import\s+(?:.*\s+from\s+)?['"]([^'"]+)['"]/g
  let match

  while ((match = importRegex.exec(code)) !== null) {
    const importPath = match[1]

    // Skip node_modules imports
    if (!importPath.startsWith(".") && !importPath.startsWith("@/")) {
      continue
    }

    // Check if file exists
    const normalizedPath = importPath.replace("@/", "").replace(/^\.\//, "")
    const possiblePaths = [
      normalizedPath,
      `${normalizedPath}.ts`,
      `${normalizedPath}.tsx`,
      `${normalizedPath}/index.ts`,
      `${normalizedPath}/index.tsx`,
    ]

    const exists = possiblePaths.some((p) => availableFiles.some((f) => f.includes(p) || f.endsWith(p)))

    if (!exists && !importPath.includes("@/components/ui")) {
      errors.push(`Missing import: ${importPath}`)
    }
  }

  return errors
}

// Run all validations on generated code
export function testGeneratedCode(files: Array<{ path: string; content: string }>): TestResult {
  const errors: string[] = []
  const warnings: string[] = []
  const filePaths = files.map((f) => f.path)

  for (const file of files) {
    // Syntax validation
    const syntaxErrors = validateSyntax(file.content, file.path)
    errors.push(...syntaxErrors)

    // Import validation
    const importErrors = validateImports(file.content, filePaths)
    warnings.push(...importErrors)

    // Check for placeholder content
    if (file.content.includes("YOUR_") || file.content.includes("REPLACE_")) {
      warnings.push(`${file.path}: Contains placeholder values`)
    }

    // Check for empty exports
    if (file.content.includes("export default function") && file.content.includes("return null")) {
      warnings.push(`${file.path}: Component returns null`)
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    testedAt: new Date(),
  }
}

// Validate that required files exist
export function validateRequiredFiles(files: Array<{ path: string; content: string }>): string[] {
  const errors: string[] = []
  const filePaths = files.map((f) => f.path)

  // Check for essential files
  const requiredPatterns = [
    { pattern: /app\/.*page\.tsx$/, name: "At least one page component" },
    { pattern: /app\/layout\.tsx$/, name: "Root layout" },
  ]

  for (const { pattern, name } of requiredPatterns) {
    if (!filePaths.some((p) => pattern.test(p))) {
      errors.push(`Missing required file: ${name}`)
    }
  }

  return errors
}

interface TestOptions {
  checkSyntax?: boolean
  checkImports?: boolean
  checkPlaceholders?: boolean
}

export function testGeneratedFiles(
  files: Array<{ path: string; content: string }>,
  options: TestOptions = {},
): TestResult {
  const { checkSyntax = true, checkImports = true, checkPlaceholders = true } = options
  const errors: string[] = []
  const warnings: string[] = []
  const filePaths = files.map((f) => f.path)

  for (const file of files) {
    // Syntax validation
    if (checkSyntax) {
      const syntaxErrors = validateSyntax(file.content, file.path)
      errors.push(...syntaxErrors)
    }

    // Import validation
    if (checkImports) {
      const importErrors = validateImports(file.content, filePaths)
      warnings.push(...importErrors)
    }

    // Check for placeholder content
    if (checkPlaceholders) {
      if (file.content.includes("YOUR_") || file.content.includes("REPLACE_")) {
        warnings.push(`${file.path}: Contains placeholder values`)
      }

      if (file.content.includes("TODO") || file.content.includes("FIXME")) {
        warnings.push(`${file.path}: Contains TODO/FIXME comments`)
      }
    }

    // Check for empty exports
    if (file.content.includes("export default function") && file.content.includes("return null")) {
      warnings.push(`${file.path}: Component returns null`)
    }
  }

  // Validate required files
  const requiredFileErrors = validateRequiredFiles(files)
  errors.push(...requiredFileErrors)

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    testedAt: new Date(),
  }
}

// Generate static HTML preview
export function generatePreviewHTML(files: Array<{ path: string; content: string }>): string {
  // Find the main page component
  const pageFile = files.find((f) => f.path.includes("page.tsx") || f.path.includes("page.jsx"))
  const layoutFile = files.find((f) => f.path.includes("layout.tsx") || f.path.includes("layout.jsx"))
  const globalsCss = files.find((f) => f.path.includes("globals.css"))

  // Extract component names and basic structure
  const componentFiles = files.filter((f) => f.path.includes("components/"))

  // Build a simple HTML preview
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview - Generated App</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${globalsCss?.content || ""}
    body { font-family: system-ui, -apple-system, sans-serif; }
    .preview-container { padding: 1rem; }
    .file-preview { margin-bottom: 2rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
    .file-name { font-weight: 600; margin-bottom: 0.5rem; color: #374151; }
    .code-preview { background: #f9fafb; padding: 1rem; border-radius: 0.25rem; overflow-x: auto; font-family: monospace; font-size: 0.875rem; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }
  </style>
</head>
<body class="bg-gray-50">
  <div class="preview-container max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Generated App Preview</h1>
    <p class="text-gray-600 mb-6">This is a static preview of the generated files. The actual app will be fully interactive when deployed.</p>
    
    <div class="grid gap-4">
      <div class="bg-white p-4 rounded-lg shadow-sm border">
        <h2 class="font-semibold mb-2">Files Generated (${files.length})</h2>
        <ul class="text-sm text-gray-600 space-y-1">
          ${files.map((f) => `<li>📄 ${f.path}</li>`).join("\n          ")}
        </ul>
      </div>
`

  // Add preview of key files
  const keyFiles = [pageFile, layoutFile, ...componentFiles.slice(0, 3)].filter(Boolean)

  for (const file of keyFiles) {
    if (!file) continue
    const escapedContent = file.content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .slice(0, 2000)

    html += `
      <div class="file-preview bg-white shadow-sm">
        <div class="file-name">📄 ${file.path}</div>
        <div class="code-preview">${escapedContent}${file.content.length > 2000 ? "\n\n... (truncated)" : ""}</div>
      </div>
`
  }

  html += `
    </div>
  </div>
</body>
</html>`

  return html
}
