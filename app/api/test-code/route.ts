import { type NextRequest, NextResponse } from "next/server"
import { testGeneratedFiles, generatePreviewHTML } from "@/lib/code-tester"

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json()

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: "Files array required" }, { status: 400 })
    }

    // Run tests
    const testResult = testGeneratedFiles(files, {
      checkSyntax: true,
      checkImports: true,
    })

    // Generate preview HTML
    const previewHTML = generatePreviewHTML(files)

    return NextResponse.json({
      testResult,
      previewHTML,
      summary: {
        totalFiles: files.length,
        passed: testResult.passed,
        errorCount: testResult.errors.length,
        warningCount: testResult.warnings.length,
      },
    })
  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json({ error: "Testing failed" }, { status: 500 })
  }
}
