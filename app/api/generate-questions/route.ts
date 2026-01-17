import { type NextRequest, NextResponse } from "next/server"
import { analyzeAndGenerateQuestions, flattenQuestions, type GeneratedQuestions } from "@/lib/question-generator"

export async function POST(request: NextRequest) {
  try {
    const { appDescription } = await request.json()

    const generatedQuestions: GeneratedQuestions = await analyzeAndGenerateQuestions(appDescription)

    // Flatten questions for backward compatibility with existing UI
    const questions = flattenQuestions(generatedQuestions)

    return NextResponse.json({
      questions,
      // Also return full analysis for enhanced UI
      analysis: generatedQuestions.analysis,
      categories: generatedQuestions.categories,
      totalQuestions: generatedQuestions.totalQuestions,
    })
  } catch (error) {
    console.error("Error generating questions:", error)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}
