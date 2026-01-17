import { createClient } from "@/lib/supabase/server"

// Claude Sonnet 4 pricing (as of 2025)
const PRICING = {
  inputPerMillion: 3.0, // $3 per 1M input tokens
  outputPerMillion: 15.0, // $15 per 1M output tokens
}

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  model: string
  costUsd: number
}

export function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * PRICING.inputPerMillion
  const outputCost = (outputTokens / 1_000_000) * PRICING.outputPerMillion
  return inputCost + outputCost
}

export async function trackTokenUsage(
  buildId: string,
  iteration: number,
  inputTokens: number,
  outputTokens: number,
  model = "anthropic/claude-sonnet-4",
): Promise<void> {
  const supabase = await createClient()
  const costUsd = calculateCost(inputTokens, outputTokens)

  // Insert token usage record
  await supabase.from("token_usage").insert({
    build_id: buildId,
    iteration,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    model,
    cost_usd: costUsd,
  })

  // Update build totals
  await supabase.rpc("increment_build_tokens", {
    p_build_id: buildId,
    p_input_tokens: inputTokens,
    p_output_tokens: outputTokens,
  })
}

export async function getBuildTokenUsage(buildId: string): Promise<{
  totalInput: number
  totalOutput: number
  totalCost: number
  byIteration: TokenUsage[]
}> {
  const supabase = await createClient()

  const { data: usage } = await supabase
    .from("token_usage")
    .select("*")
    .eq("build_id", buildId)
    .order("iteration", { ascending: true })

  if (!usage || usage.length === 0) {
    return {
      totalInput: 0,
      totalOutput: 0,
      totalCost: 0,
      byIteration: [],
    }
  }

  const totalInput = usage.reduce((sum, u) => sum + u.input_tokens, 0)
  const totalOutput = usage.reduce((sum, u) => sum + u.output_tokens, 0)
  const totalCost = usage.reduce((sum, u) => sum + Number(u.cost_usd), 0)

  return {
    totalInput,
    totalOutput,
    totalCost,
    byIteration: usage.map((u) => ({
      inputTokens: u.input_tokens,
      outputTokens: u.output_tokens,
      model: u.model,
      costUsd: Number(u.cost_usd),
    })),
  }
}
