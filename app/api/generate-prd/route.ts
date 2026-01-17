import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { appDescription, questionsAndAnswers } = await request.json()

    const qaText = Object.entries(questionsAndAnswers)
      .map(([q, a]) => `Q: ${q}\nA: ${a}`)
      .join("\n\n")

    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4",
      prompt: `You are a product manager. Create a detailed Product Requirements Document (PRD) based on the following app idea and clarifying answers.

App Description: ${appDescription}

Clarifying Questions & Answers:
${qaText}

Create a comprehensive PRD that includes:
1. Overview & Purpose
2. Target Users
3. Core Features (prioritized)
4. Technical Requirements
5. User Stories
6. Success Metrics
7. Out of Scope (for v1)

Format the PRD in clean markdown. Be specific and actionable.`,
    })

    return NextResponse.json({ prd: text })
  } catch (error) {
    console.error("Error generating PRD:", error)
    return NextResponse.json({ error: "Failed to generate PRD" }, { status: 500 })
  }
}
