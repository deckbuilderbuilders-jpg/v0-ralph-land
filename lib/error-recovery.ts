/**
 * Error Recovery Utility
 * Handles build failures and provides recovery mechanisms
 */

import type { GeneratedFile } from "./file-parser"
import type { BuildContext } from "./build-context"

export interface BuildError {
  iteration: number
  error: string
  retryable: boolean
  suggestion?: string
}

export interface RecoveryState {
  lastSuccessfulIteration: number
  lastSuccessfulFiles: GeneratedFile[]
  errors: BuildError[]
  retryCount: number
  maxRetries: number
}

/**
 * Initialize recovery state
 */
export function initRecoveryState(): RecoveryState {
  return {
    lastSuccessfulIteration: 0,
    lastSuccessfulFiles: [],
    errors: [],
    retryCount: 0,
    maxRetries: 3,
  }
}

/**
 * Analyze error and determine if retry is possible
 */
export function analyzeError(error: unknown, iteration: number): BuildError {
  const errorStr = error instanceof Error ? error.message : String(error)

  // Timeout errors - retryable
  if (errorStr.includes("timeout") || errorStr.includes("ETIMEDOUT")) {
    return {
      iteration,
      error: "Request timed out",
      retryable: true,
      suggestion: "The request took too long. We'll retry with a simpler prompt.",
    }
  }

  // Rate limit - retryable with delay
  if (errorStr.includes("rate limit") || errorStr.includes("429")) {
    return {
      iteration,
      error: "Rate limited by API",
      retryable: true,
      suggestion: "Too many requests. Waiting before retry...",
    }
  }

  // Parse errors - retryable with different approach
  if (errorStr.includes("parse") || errorStr.includes("JSON")) {
    return {
      iteration,
      error: "Failed to parse generated code",
      retryable: true,
      suggestion: "Output format was incorrect. Retrying with clearer instructions.",
    }
  }

  // Token limit - not directly retryable, need to simplify
  if (errorStr.includes("token") || errorStr.includes("context length")) {
    return {
      iteration,
      error: "Context too large",
      retryable: true,
      suggestion: "Reducing context size and retrying.",
    }
  }

  // Payment errors - not retryable
  if (errorStr.includes("payment") || errorStr.includes("402")) {
    return {
      iteration,
      error: "Payment required",
      retryable: false,
      suggestion: "Please complete payment to continue.",
    }
  }

  // Unknown errors - retry once
  return {
    iteration,
    error: errorStr,
    retryable: true,
    suggestion: "An unexpected error occurred. Retrying...",
  }
}

/**
 * Update recovery state after successful iteration
 */
export function recordSuccess(state: RecoveryState, iteration: number, files: GeneratedFile[]): RecoveryState {
  return {
    ...state,
    lastSuccessfulIteration: iteration,
    lastSuccessfulFiles: files,
    retryCount: 0, // Reset retry count on success
  }
}

/**
 * Update recovery state after failed iteration
 */
export function recordFailure(state: RecoveryState, error: BuildError): RecoveryState {
  return {
    ...state,
    errors: [...state.errors, error],
    retryCount: state.retryCount + 1,
  }
}

/**
 * Check if we should retry
 */
export function shouldRetry(state: RecoveryState, error: BuildError): boolean {
  return error.retryable && state.retryCount < state.maxRetries
}

/**
 * Get delay before retry (exponential backoff)
 */
export function getRetryDelay(retryCount: number): number {
  return Math.min(1000 * Math.pow(2, retryCount), 30000) // Max 30 seconds
}

/**
 * Save recovery state to localStorage for browser refresh recovery
 */
export function saveRecoveryState(
  buildId: string,
  state: RecoveryState,
  context: BuildContext,
  files: GeneratedFile[],
): void {
  if (typeof window === "undefined") return

  const recoveryData = {
    buildId,
    state,
    context,
    files,
    savedAt: new Date().toISOString(),
  }

  try {
    localStorage.setItem(`ralph-build-${buildId}`, JSON.stringify(recoveryData))
  } catch (e) {
    console.error("Failed to save recovery state:", e)
  }
}

/**
 * Load recovery state from localStorage
 */
export function loadRecoveryState(buildId: string): {
  state: RecoveryState
  context: BuildContext
  files: GeneratedFile[]
} | null {
  if (typeof window === "undefined") return null

  try {
    const data = localStorage.getItem(`ralph-build-${buildId}`)
    if (!data) return null

    const parsed = JSON.parse(data)

    // Check if saved state is less than 1 hour old
    const savedAt = new Date(parsed.savedAt)
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
    if (savedAt < hourAgo) {
      localStorage.removeItem(`ralph-build-${buildId}`)
      return null
    }

    return {
      state: parsed.state,
      context: parsed.context,
      files: parsed.files,
    }
  } catch (e) {
    console.error("Failed to load recovery state:", e)
    return null
  }
}

/**
 * Clear recovery state after successful build
 */
export function clearRecoveryState(buildId: string): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(`ralph-build-${buildId}`)
}
