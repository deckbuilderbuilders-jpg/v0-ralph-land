"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MessageSquare, ArrowRight, ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { StepProgress, STEP_ESTIMATES } from "@/components/step-progress"

export function ClarifyStep() {
  const {
    questions,
    answers,
    setAnswer,
    setStep,
    setPrd,
    setIsLoading,
    isLoading,
    appDescription,
    questionAnalysis,
    questionCategories,
  } = useAppStore()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [localAnswer, setLocalAnswer] = useState(answers[questions[0]] || "")

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const currentCategory = questionCategories.find((cat) => cat.questions.includes(currentQuestion))

  const handleNext = async () => {
    setAnswer(currentQuestion, localAnswer)

    if (isLastQuestion) {
      setIsLoading(true)
      try {
        const updatedAnswers = { ...answers, [currentQuestion]: localAnswer }
        const response = await fetch("/api/generate-prd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appDescription,
            questionsAndAnswers: updatedAnswers,
            analysis: questionAnalysis,
          }),
        })

        if (!response.ok) throw new Error("Failed to generate PRD")

        const data = await response.json()
        setPrd(data.prd)
        setStep("prd")
      } catch {
        console.error("Error generating PRD")
      } finally {
        setIsLoading(false)
      }
    } else {
      setCurrentQuestionIndex((i) => i + 1)
      setLocalAnswer(answers[questions[currentQuestionIndex + 1]] || "")
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setAnswer(currentQuestion, localAnswer)
      setCurrentQuestionIndex((i) => i - 1)
      setLocalAnswer(answers[questions[currentQuestionIndex - 1]] || "")
    } else {
      setStep("describe")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto max-w-2xl"
    >
      <div className="mb-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
        >
          <MessageSquare className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="mb-3 text-3xl font-bold">Let&apos;s clarify your vision</h2>
        <p className="text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      <StepProgress
        isLoading={isLoading}
        stepName={STEP_ESTIMATES.generatePrd.name}
        estimatedSeconds={STEP_ESTIMATES.generatePrd.seconds}
        description={STEP_ESTIMATES.generatePrd.description}
      />

      {questionAnalysis && currentQuestionIndex === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI Analysis</span>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            Detected app type: <span className="font-medium text-foreground">{questionAnalysis.suggestedCategory}</span>
            {" · "}
            Complexity: <span className="font-medium text-foreground">{questionAnalysis.complexity}</span>
          </p>
          {questionAnalysis.identifiedFeatures.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {questionAnalysis.identifiedFeatures.slice(0, 5).map((feature, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {questionAnalysis.identifiedFeatures.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{questionAnalysis.identifiedFeatures.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </motion.div>
      )}

      {!isLoading && (
        <>
          <div className="mb-4 flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= currentQuestionIndex ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {currentCategory && (
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    currentCategory.priority === 1
                      ? "default"
                      : currentCategory.priority === 2
                        ? "secondary"
                        : "outline"
                  }
                >
                  {currentCategory.category}
                </Badge>
                {currentCategory.priority === 1 && <span className="text-xs text-muted-foreground">Required</span>}
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-lg font-medium">{currentQuestion}</p>
              {currentCategory?.reason && (
                <p className="mt-2 text-sm text-muted-foreground">{currentCategory.reason}</p>
              )}
            </div>

            <Textarea
              placeholder="Your answer..."
              value={localAnswer}
              onChange={(e) => setLocalAnswer(e.target.value)}
              className="min-h-[120px] resize-none border-border bg-card text-base"
            />

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="h-12 flex-1 bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleNext} disabled={!localAnswer.trim() || isLoading} className="h-12 flex-1">
                {isLastQuestion ? "Generate PRD" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
