// Token estimation logic based on app complexity analysis
// Claude pricing: $3/1M input tokens, $15/1M output tokens (Sonnet 4)

export interface ComplexityAnalysis {
  pages: number
  components: number
  features: {
    authentication: boolean
    database: boolean
    payments: boolean
    fileUpload: boolean
    realtime: boolean
    apiIntegrations: number
    forms: number
  }
  estimatedLinesOfCode: number
  complexity: "simple" | "medium" | "complex" | "enterprise"
}

export interface TokenEstimate {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  iterations: number
  breakdown: {
    prdTokens: number
    codeGenerationTokens: number
    iterationTokens: number
  }
}

export interface PricingEstimate {
  inputCost: number
  outputCost: number
  baseCost: number
  margin: number
  totalCost: number
}

// Claude Sonnet 4 pricing per million tokens
const CLAUDE_PRICING = {
  inputPerMillion: 3.0,
  outputPerMillion: 15.0,
}

// Our margin on top of Claude costs
const MARGIN_MULTIPLIER = 2.5

// Average tokens per line of code (including prompts and context)
const TOKENS_PER_LOC = 4

// Base prompt tokens for each generation call
const BASE_PROMPT_TOKENS = 2000

// Feature complexity weights (affects estimated lines of code)
const FEATURE_WEIGHTS = {
  authentication: 800,
  database: 600,
  payments: 500,
  fileUpload: 400,
  realtime: 700,
  apiIntegration: 300,
  form: 150,
  page: 250,
  component: 100,
}

export function analyzeComplexity(prd: string): ComplexityAnalysis {
  const prdLower = prd.toLowerCase()

  // Detect features from PRD content
  const features = {
    authentication: /\b(auth|login|signup|sign.?up|sign.?in|password|oauth|jwt|session)\b/i.test(prd),
    database: /\b(database|db|storage|persist|crud|sql|postgres|mysql|mongo|supabase|firebase)\b/i.test(prd),
    payments: /\b(payment|stripe|checkout|subscription|billing|purchase|cart|e.?commerce)\b/i.test(prd),
    fileUpload: /\b(upload|file|image|media|attachment|storage|s3|blob)\b/i.test(prd),
    realtime: /\b(realtime|real.?time|websocket|live|streaming|notification|chat)\b/i.test(prd),
    apiIntegrations: (prd.match(/\b(api|integration|third.?party|external|webhook)\b/gi) || []).length,
    forms: (prd.match(/\b(form|input|submit|validation)\b/gi) || []).length,
  }

  // Estimate pages from PRD mentions
  const pageMatches = prd.match(/\b(page|screen|view|route|dashboard|home|landing|profile|settings)\b/gi) || []
  const pages = Math.max(3, Math.min(15, new Set(pageMatches.map((p) => p.toLowerCase())).size))

  // Estimate components (roughly 3-5 per page plus shared)
  const components = pages * 4 + 10

  // Calculate estimated lines of code
  let estimatedLinesOfCode = pages * FEATURE_WEIGHTS.page + components * FEATURE_WEIGHTS.component

  if (features.authentication) estimatedLinesOfCode += FEATURE_WEIGHTS.authentication
  if (features.database) estimatedLinesOfCode += FEATURE_WEIGHTS.database
  if (features.payments) estimatedLinesOfCode += FEATURE_WEIGHTS.payments
  if (features.fileUpload) estimatedLinesOfCode += FEATURE_WEIGHTS.fileUpload
  if (features.realtime) estimatedLinesOfCode += FEATURE_WEIGHTS.realtime
  estimatedLinesOfCode += features.apiIntegrations * FEATURE_WEIGHTS.apiIntegration
  estimatedLinesOfCode += Math.min(features.forms, 10) * FEATURE_WEIGHTS.form

  // Determine complexity tier
  let complexity: ComplexityAnalysis["complexity"]
  if (estimatedLinesOfCode < 2000) {
    complexity = "simple"
  } else if (estimatedLinesOfCode < 5000) {
    complexity = "medium"
  } else if (estimatedLinesOfCode < 10000) {
    complexity = "complex"
  } else {
    complexity = "enterprise"
  }

  return {
    pages,
    components,
    features,
    estimatedLinesOfCode,
    complexity,
  }
}

export function estimateTokens(analysis: ComplexityAnalysis): TokenEstimate {
  const { estimatedLinesOfCode, complexity } = analysis

  // Iterations based on complexity
  const iterationsByComplexity = {
    simple: 2,
    medium: 4,
    complex: 6,
    enterprise: 10,
  }
  const iterations = iterationsByComplexity[complexity]

  // PRD is already generated, but we need tokens for code generation prompts
  const prdTokens = 3000 // PRD context tokens

  // Code generation: each iteration generates code with context
  const codePerIteration = estimatedLinesOfCode / iterations
  const tokensPerIteration = codePerIteration * TOKENS_PER_LOC
  const codeGenerationTokens = tokensPerIteration * iterations

  // Input tokens: prompts + context for each iteration
  const inputTokens = (BASE_PROMPT_TOKENS + prdTokens) * iterations

  // Output tokens: generated code
  const outputTokens = Math.round(codeGenerationTokens)

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    iterations,
    breakdown: {
      prdTokens,
      codeGenerationTokens,
      iterationTokens: tokensPerIteration,
    },
  }
}

export function calculatePricing(tokenEstimate: TokenEstimate): PricingEstimate {
  const { inputTokens, outputTokens } = tokenEstimate

  // Calculate raw Claude costs
  const inputCost = (inputTokens / 1_000_000) * CLAUDE_PRICING.inputPerMillion
  const outputCost = (outputTokens / 1_000_000) * CLAUDE_PRICING.outputPerMillion
  const baseCost = inputCost + outputCost

  // Apply margin
  const margin = baseCost * (MARGIN_MULTIPLIER - 1)
  const totalCost = baseCost * MARGIN_MULTIPLIER

  // Round to nearest cent, minimum $5
  return {
    inputCost: Math.round(inputCost * 100) / 100,
    outputCost: Math.round(outputCost * 100) / 100,
    baseCost: Math.round(baseCost * 100) / 100,
    margin: Math.round(margin * 100) / 100,
    totalCost: Math.max(5, Math.round(totalCost * 100) / 100),
  }
}

export function getComplexityLabel(complexity: ComplexityAnalysis["complexity"]): string {
  const labels = {
    simple: "Simple App",
    medium: "Medium Complexity",
    complex: "Complex Application",
    enterprise: "Enterprise Grade",
  }
  return labels[complexity]
}
