import { create } from "zustand"
import type { GeneratedFile } from "./file-parser"
import type { BuildContext, TodoItem, IterationResult } from "./build-context"
import type { TestResult } from "./code-tester"
import type { GapAnalysis, QuestionCategory } from "./question-generator"

export type Step = "describe" | "clarify" | "prd" | "estimate" | "approve" | "build" | "download"

export interface CostEstimate {
  complexity: "simple" | "medium" | "complex" | "enterprise"
  label: string
  analysis?: {
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
  }
  pricing: {
    inputCost: number
    outputCost: number
    totalCost: number
  }
  estimates: {
    iterations: number
    totalTokens: number
    inputTokens?: number
    outputTokens?: number
  }
}

interface BuildLog {
  iteration: number
  message: string
  timestamp: Date
  type?: "info" | "success" | "warning" | "error"
}

interface PaymentVerification {
  verified: boolean
  sessionId: string
  amountPaid: number
  customerEmail?: string
}

interface GitHubConfig {
  token: string
  owner: string
  repo: string
  connected: boolean
}

interface TokenUsage {
  estimated: { input: number; output: number; cost: number }
  actual: { input: number; output: number; cost: number }
}

interface AppState {
  currentStep: Step
  appDescription: string
  questions: string[]
  answers: Record<string, string>
  prd: string
  costEstimate: CostEstimate | null
  buildLogs: BuildLog[]
  buildProgress: number
  generatedCode: string
  generatedFiles: GeneratedFile[]
  isLoading: boolean
  error: string | null
  stripeSessionId: string | null
  paymentVerification: PaymentVerification | null

  buildContext: BuildContext | null
  todoList: TodoItem[]
  iterationResults: IterationResult[]
  currentTestResult: TestResult | null
  previewHTML: string | null
  githubConfig: GitHubConfig | null
  lastGithubSync: { commitSha: string; timestamp: Date } | null

  questionAnalysis: GapAnalysis | null
  questionCategories: QuestionCategory[]

  tokenUsage: TokenUsage | null

  buildId: string | null
  userId: string | null

  setStep: (step: Step) => void
  setAppDescription: (desc: string) => void
  setQuestions: (questions: string[]) => void
  setAnswer: (question: string, answer: string) => void
  setPrd: (prd: string) => void
  setCostEstimate: (estimate: CostEstimate) => void
  addBuildLog: (log: Omit<BuildLog, "timestamp">) => void
  setBuildProgress: (progress: number) => void
  setGeneratedCode: (code: string) => void
  setGeneratedFiles: (files: GeneratedFile[]) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setStripeSessionId: (id: string | null) => void
  setPaymentVerification: (verification: PaymentVerification | null) => void

  setBuildContext: (context: BuildContext) => void
  updateTodoItem: (id: string, updates: Partial<TodoItem>) => void
  addIterationResult: (result: IterationResult) => void
  setCurrentTestResult: (result: TestResult | null) => void
  setPreviewHTML: (html: string | null) => void
  setGitHubConfig: (config: GitHubConfig | null) => void
  setLastGithubSync: (sync: { commitSha: string; timestamp: Date } | null) => void

  setQuestionAnalysis: (analysis: GapAnalysis | null) => void
  setQuestionCategories: (categories: QuestionCategory[]) => void
  setTokenUsage: (usage: TokenUsage | null) => void
  updateActualTokens: (input: number, output: number) => void
  setBuildId: (id: string | null) => void
  setUserId: (id: string | null) => void

  reset: () => void
}

const initialState = {
  currentStep: "describe" as Step,
  appDescription: "",
  questions: [],
  answers: {},
  prd: "",
  costEstimate: null,
  buildLogs: [],
  buildProgress: 0,
  generatedCode: "",
  generatedFiles: [] as GeneratedFile[],
  isLoading: false,
  error: null,
  stripeSessionId: null,
  paymentVerification: null,
  buildContext: null,
  todoList: [] as TodoItem[],
  iterationResults: [] as IterationResult[],
  currentTestResult: null,
  previewHTML: null,
  githubConfig: null,
  lastGithubSync: null,
  questionAnalysis: null,
  questionCategories: [] as QuestionCategory[],
  tokenUsage: null,
  buildId: null,
  userId: null,
}

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  setAppDescription: (appDescription) => set({ appDescription }),
  setQuestions: (questions) => set({ questions }),
  setAnswer: (question, answer) =>
    set((state) => ({
      answers: { ...state.answers, [question]: answer },
    })),
  setPrd: (prd) => set({ prd }),
  setCostEstimate: (costEstimate) => set({ costEstimate }),
  addBuildLog: (log) =>
    set((state) => ({
      buildLogs: [...state.buildLogs, { ...log, timestamp: new Date() }],
    })),
  setBuildProgress: (buildProgress) => set({ buildProgress }),
  setGeneratedCode: (generatedCode) => set({ generatedCode }),
  setGeneratedFiles: (generatedFiles) => set({ generatedFiles }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setStripeSessionId: (stripeSessionId) => set({ stripeSessionId }),
  setPaymentVerification: (paymentVerification) => set({ paymentVerification }),

  setBuildContext: (buildContext) => set({ buildContext }),
  updateTodoItem: (id, updates) =>
    set((state) => ({
      todoList: state.todoList.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      buildContext: state.buildContext
        ? {
            ...state.buildContext,
            todoList: state.buildContext.todoList.map((item) => (item.id === id ? { ...item, ...updates } : item)),
          }
        : null,
    })),
  addIterationResult: (result) =>
    set((state) => ({
      iterationResults: [...state.iterationResults, result],
      buildContext: state.buildContext
        ? {
            ...state.buildContext,
            iterationHistory: [...state.buildContext.iterationHistory, result],
          }
        : null,
    })),
  setCurrentTestResult: (currentTestResult) => set({ currentTestResult }),
  setPreviewHTML: (previewHTML) => set({ previewHTML }),
  setGitHubConfig: (githubConfig) => set({ githubConfig }),
  setLastGithubSync: (lastGithubSync) => set({ lastGithubSync }),

  setQuestionAnalysis: (questionAnalysis) => set({ questionAnalysis }),
  setQuestionCategories: (questionCategories) => set({ questionCategories }),
  setTokenUsage: (tokenUsage) => set({ tokenUsage }),
  updateActualTokens: (input, output) =>
    set((state) => ({
      tokenUsage: state.tokenUsage
        ? {
            ...state.tokenUsage,
            actual: {
              input: state.tokenUsage.actual.input + input,
              output: state.tokenUsage.actual.output + output,
              cost: state.tokenUsage.actual.cost + (input / 1_000_000) * 3 + (output / 1_000_000) * 15,
            },
          }
        : null,
    })),
  setBuildId: (buildId) => set({ buildId }),
  setUserId: (userId) => set({ userId }),

  reset: () => set(initialState),
}))
