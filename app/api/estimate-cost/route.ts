import { type NextRequest, NextResponse } from "next/server"
import { analyzeComplexity, estimateTokens, calculatePricing, getComplexityLabel } from "@/lib/token-estimation"

export async function POST(request: NextRequest) {
  try {
    const { prd } = await request.json()

    if (!prd || typeof prd !== "string") {
      return NextResponse.json({ error: "PRD is required" }, { status: 400 })
    }

    // Analyze PRD complexity
    const complexityAnalysis = analyzeComplexity(prd)

    // Estimate tokens based on complexity
    const tokenEstimate = estimateTokens(complexityAnalysis)

    // Calculate pricing with margin
    const pricing = calculatePricing(tokenEstimate)

    return NextResponse.json({
      complexity: complexityAnalysis.complexity,
      label: getComplexityLabel(complexityAnalysis.complexity),
      analysis: {
        pages: complexityAnalysis.pages,
        components: complexityAnalysis.components,
        features: complexityAnalysis.features,
        estimatedLinesOfCode: complexityAnalysis.estimatedLinesOfCode,
      },
      pricing: {
        inputCost: pricing.inputCost,
        outputCost: pricing.outputCost,
        totalCost: pricing.totalCost,
      },
      estimates: {
        iterations: tokenEstimate.iterations,
        totalTokens: tokenEstimate.totalTokens,
        inputTokens: tokenEstimate.inputTokens,
        outputTokens: tokenEstimate.outputTokens,
      },
    })
  } catch (error) {
    console.error("Error estimating cost:", error)
    return NextResponse.json({ error: "Failed to estimate cost" }, { status: 500 })
  }
}
