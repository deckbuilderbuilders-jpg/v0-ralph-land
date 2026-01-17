// Code testing and validation system

export interface TestConfig {
  timeout: number
  checkSyntax: boolean
  checkImports: boolean
  checkTypes: boolean
}

export interface TestResult {
  passed: boolean
  errors: string[]
  warnings: string[]
  testedAt: Date
  details?: {
    syntaxErrors: string[]
    missingImports: string[]
    typeErrors: string[]
    runtimeErrors: string[]
  }
}

// Basic syntax validation using regex patterns
export function validateSyntax(code: string, filePath: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const ext = filePath.split(".").pop()

  if (ext === "tsx" || ext === "ts" || ext === "jsx" || ext === "js") {
    // Check for unclosed brackets
    const openBrackets = (code.match(/\{/g) || []).length
    const closeBrackets = (code.match(/\}/g) || []).length
    if (openBrackets !== closeBrackets) {
      errors.push(`Unbalanced curly braces: ${openBrackets} open, ${closeBrackets} close`)
    }

    // Check for unclosed parentheses
    const openParens = (code.match(/\(/g) || []).length
    const closeParens = (code.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      errors.push(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`)
    }

    // Check for unclosed strings
    const singleQuotes = (code.match(/'/g) || []).length
    const doubleQuotes = (code.match(/"/g) || []).length
    const templateLiterals = (code.match(/`/g) || []).length
    if (singleQuotes % 2 !== 0) errors.push("Unclosed single quote string")
    if (doubleQuotes % 2 !== 0) errors.push("Unclosed double quote string")
    if (templateLiterals % 2 !== 0) errors.push("Unclosed template literal")

    // Check for common React errors
    if (ext === "tsx" || ext === "jsx") {
      if (code.includes("export default function") && !code.includes("return")) {
        errors.push("Component function may be missing return statement")
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

// Check for missing imports
export function checkImports(code: string, availableFiles: string[]): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  // Extract imports
  const importMatches = code.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g)

  for (const match of importMatches) {
    const importPath = match[1]

    // Skip external packages
    if (!importPath.startsWith("@/") && !importPath.startsWith("./") && !importPath.startsWith("../")) {
      continue
    }

    // Convert to file path
    const filePath = importPath.replace("@/", "")
    if (!filePath.includes(".")) {
      // Try common extensions
      const possiblePaths = [`${filePath}.ts`, `${filePath}.tsx`, `${filePath}/index.ts`, `${filePath}/index.tsx`]

      const found = possiblePaths.some((p) => availableFiles.includes(p))
      if (!found) {
        missing.push(importPath)
      }
    }
  }

  return { valid: missing.length === 0, missing }
}

// Run tests on generated files
export function testGeneratedFiles(
  files: Array<{ path: string; content: string }>,
  config: Partial<TestConfig> = {},
): TestResult {
  const defaultConfig: TestConfig = {
    timeout: 5000,
    checkSyntax: true,
    checkImports: true,
    checkTypes: false, // TypeScript checking would need actual compiler
  }

  const finalConfig = { ...defaultConfig, ...config }
  const errors: string[] = []
  const warnings: string[] = []
  const details = {
    syntaxErrors: [] as string[],
    missingImports: [] as string[],
    typeErrors: [] as string[],
    runtimeErrors: [] as string[],
  }

  const filePaths = files.map((f) => f.path)

  for (const file of files) {
    // Syntax check
    if (finalConfig.checkSyntax) {
      const syntaxResult = validateSyntax(file.content, file.path)
      if (!syntaxResult.valid) {
        details.syntaxErrors.push(...syntaxResult.errors.map((e) => `${file.path}: ${e}`))
        errors.push(...syntaxResult.errors.map((e) => `${file.path}: ${e}`))
      }
    }

    // Import check
    if (finalConfig.checkImports) {
      const importResult = checkImports(file.content, filePaths)
      if (!importResult.valid) {
        details.missingImports.push(...importResult.missing.map((m) => `${file.path}: missing ${m}`))
        warnings.push(...importResult.missing.map((m) => `${file.path}: potentially missing import ${m}`))
      }
    }

    // Check for placeholder code
    if (file.content.includes("// TODO") || (file.content.includes("...") && file.content.includes("implementation"))) {
      warnings.push(`${file.path}: Contains placeholder code`)
    }
  }

  // Check for required files
  const requiredFiles = ["app/layout.tsx", "app/page.tsx"]
  for (const required of requiredFiles) {
    if (!filePaths.some((p) => p.includes(required.replace("app/", "")))) {
      warnings.push(`Missing recommended file: ${required}`)
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    testedAt: new Date(),
    details,
  }
}

// Generate HTML for browser preview
export function generatePreviewHTML(files: Array<{ path: string; content: string }>): string {
  // Find the main page component
  const pageFile = files.find((f) => f.path.includes("page.tsx") || f.path.includes("page.jsx"))
  const layoutFile = files.find((f) => f.path.includes("layout.tsx") || f.path.includes("layout.jsx"))
  const globalsCss = files.find((f) => f.path.includes("globals.css"))

  // Create a simplified preview (actual React rendering would need a bundler)
  const previewHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ralph Builder Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${globalsCss?.content || ""}
  </style>
</head>
<body>
  <div id="preview-root">
    <div class="p-8 max-w-4xl mx-auto">
      <div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p class="text-yellow-800 text-sm">
          <strong>Preview Mode:</strong> This is a static preview. 
          Full interactivity requires running the built project.
        </p>
      </div>
      
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-2">Generated Files:</h2>
        <ul class="list-disc list-inside text-sm text-gray-600">
          ${files.map((f) => `<li>${f.path}</li>`).join("\n")}
        </ul>
      </div>
      
      <div class="border rounded-lg p-4 bg-gray-50">
        <h3 class="font-medium mb-2">Main Page Preview:</h3>
        <pre class="text-xs overflow-auto max-h-96 p-2 bg-white rounded border">
${pageFile?.content || "No page.tsx found"}
        </pre>
      </div>
    </div>
  </div>
</body>
</html>
`

  return previewHTML
}
