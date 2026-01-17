"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Loader2, CheckCircle2 } from "lucide-react"

interface StepProgressProps {
  isLoading: boolean
  stepName: string
  estimatedSeconds: number
  description?: string
}

export function StepProgress({ isLoading, stepName, estimatedSeconds, description }: StepProgressProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    if (isLoading && !startTime) {
      setStartTime(Date.now())
      setElapsedSeconds(0)
    } else if (!isLoading) {
      setStartTime(null)
    }
  }, [isLoading, startTime])

  useEffect(() => {
    if (!isLoading || !startTime) return

    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [isLoading, startTime])

  const progress = Math.min((elapsedSeconds / estimatedSeconds) * 100, 95)
  const remainingSeconds = Math.max(estimatedSeconds - elapsedSeconds, 0)

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (!isLoading) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full max-w-md mx-auto mb-6"
      >
        <div className="p-4 rounded-xl bg-card border border-border">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Loader2 className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="text-sm font-medium">{stepName}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>~{formatTime(remainingSeconds)} remaining</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{description || "Processing..."}</span>
            <span className="text-muted-foreground">
              {formatTime(elapsedSeconds)} / {formatTime(estimatedSeconds)}
            </span>
          </div>

          {/* Animated dots */}
          <div className="flex justify-center gap-1 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary/50"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Estimated times for each step (in seconds)
export const STEP_ESTIMATES = {
  generateQuestions: {
    name: "Generating Questions",
    seconds: 15,
    description: "AI is analyzing your app idea and creating clarifying questions",
  },
  generatePrd: {
    name: "Creating PRD",
    seconds: 30,
    description: "AI is writing your Product Requirements Document",
  },
  estimateCost: {
    name: "Calculating Estimate",
    seconds: 8,
    description: "Analyzing complexity and calculating token usage",
  },
  createCheckout: {
    name: "Preparing Checkout",
    seconds: 5,
    description: "Setting up secure payment session",
  },
  verifyPayment: {
    name: "Verifying Payment",
    seconds: 3,
    description: "Confirming your payment was successful",
  },
  buildIteration: {
    name: "Building",
    seconds: 45,
    description: "Generating code for your application",
  },
  testCode: {
    name: "Testing Code",
    seconds: 5,
    description: "Validating generated code for errors",
  },
  syncGithub: {
    name: "Syncing to GitHub",
    seconds: 8,
    description: "Pushing code to your repository",
  },
  generateZip: {
    name: "Packaging Files",
    seconds: 3,
    description: "Creating downloadable ZIP archive",
  },
}

// Build step progress with iteration awareness
interface BuildProgressProps {
  currentIteration: number
  totalIterations: number
  phase: "verifying" | "building" | "testing" | "syncing" | "complete"
  buildProgress: number
}

export function BuildProgressBar({ currentIteration, totalIterations, phase, buildProgress }: BuildProgressProps) {
  const getPhaseInfo = () => {
    switch (phase) {
      case "verifying":
        return { name: "Verifying Payment", color: "bg-yellow-500" }
      case "building":
        return { name: `Building (${currentIteration}/${totalIterations})`, color: "bg-primary" }
      case "testing":
        return { name: "Testing Code", color: "bg-blue-500" }
      case "syncing":
        return { name: "Syncing GitHub", color: "bg-purple-500" }
      case "complete":
        return { name: "Complete!", color: "bg-green-500" }
      default:
        return { name: "Processing", color: "bg-primary" }
    }
  }

  const phaseInfo = getPhaseInfo()
  const iterationProgress = ((currentIteration - 1) / totalIterations) * 100
  const estimatedTimePerIteration = 45 // seconds
  const estimatedRemainingTime = (totalIterations - currentIteration + 1) * estimatedTimePerIteration

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    return `~${mins}m`
  }

  return (
    <div className="w-full space-y-3">
      {/* Main progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            {phase === "complete" ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Loader2 className="h-4 w-4 text-primary" />
              </motion.div>
            )}
            <span className="font-medium">{phaseInfo.name}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{phase === "complete" ? "Done!" : formatTime(estimatedRemainingTime)}</span>
          </div>
        </div>

        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${phaseInfo.color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${buildProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(buildProgress)}% complete</span>
          <span>
            {currentIteration} of {totalIterations} iterations
          </span>
        </div>
      </div>

      {/* Iteration markers */}
      <div className="flex gap-1">
        {Array.from({ length: totalIterations }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < currentIteration ? "bg-primary" : i === currentIteration - 1 ? "bg-primary/50" : "bg-secondary"
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          />
        ))}
      </div>
    </div>
  )
}
