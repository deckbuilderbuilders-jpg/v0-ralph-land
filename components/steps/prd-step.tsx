"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FileText, ArrowRight, ArrowLeft, Edit3, Check, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/lib/store"
import { StepProgress, STEP_ESTIMATES } from "@/components/step-progress"

export function PrdStep() {
  const { prd, setPrd, setStep, setCostEstimate, setIsLoading, isLoading, appDescription, answers } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editedPrd, setEditedPrd] = useState(prd)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!prd && appDescription && Object.keys(answers).length > 0 && !isGenerating) {
      generatePrd()
    }
  }, [])

  useEffect(() => {
    setEditedPrd(prd)
  }, [prd])

  const generatePrd = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      console.log("[v0] Generating PRD with:", { appDescription, answers })
      const response = await fetch("/api/generate-prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appDescription,
          questionsAndAnswers: answers,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to generate PRD")
      }

      const data = await response.json()
      console.log("[v0] PRD generated:", data.prd?.substring(0, 100))
      if (data.prd) {
        setPrd(data.prd)
        setEditedPrd(data.prd)
      } else {
        throw new Error("No PRD returned from API")
      }
    } catch (err) {
      console.error("[v0] Error generating PRD:", err)
      setError(err instanceof Error ? err.message : "Failed to generate PRD")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/estimate-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prd }),
      })

      if (!response.ok) throw new Error("Failed to estimate cost")

      const data = await response.json()
      setCostEstimate(data)
      setStep("estimate")
    } catch {
      console.error("Error estimating cost")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEdit = () => {
    setPrd(editedPrd)
    setIsEditing(false)
  }

  if (isGenerating || (!prd && !error)) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6"
          >
            <FileText className="h-8 w-8 text-primary" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-3">Generating Your PRD</h2>
          <p className="text-muted-foreground">
            Creating a detailed Product Requirements Document based on your inputs...
          </p>
        </div>

        <StepProgress
          isLoading={true}
          stepName={STEP_ESTIMATES.generatePrd.name}
          estimatedSeconds={STEP_ESTIMATES.generatePrd.seconds}
          description={STEP_ESTIMATES.generatePrd.description}
        />

        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-6"
          >
            <AlertCircle className="h-8 w-8 text-destructive" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-3">Error Generating PRD</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setStep("clarify")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={generatePrd}>Try Again</Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6"
        >
          <FileText className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3">Review Your PRD</h2>
        <p className="text-muted-foreground">
          Review the generated Product Requirements Document. Feel free to edit it.
        </p>
      </div>

      <StepProgress
        isLoading={isLoading}
        stepName={STEP_ESTIMATES.estimateCost.name}
        estimatedSeconds={STEP_ESTIMATES.estimateCost.seconds}
        description={STEP_ESTIMATES.estimateCost.description}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Product Requirements Document</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (isEditing ? handleSaveEdit() : setIsEditing(true))}
            disabled={isLoading}
          >
            {isEditing ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Save
              </>
            ) : (
              <>
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </>
            )}
          </Button>
        </div>

        {isEditing ? (
          <Textarea
            value={editedPrd}
            onChange={(e) => setEditedPrd(e.target.value)}
            className="min-h-[400px] text-sm font-mono bg-card border-border resize-none"
            disabled={isLoading}
          />
        ) : (
          <div className="p-6 rounded-xl bg-card border border-border max-h-[400px] overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono text-foreground/90">
              {prd || "No PRD generated yet."}
            </pre>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep("clarify")} className="flex-1 h-12" disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleContinue} disabled={isLoading || !prd} className="flex-1 h-12">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="h-5 w-5 border-2 border-current border-t-transparent rounded-full"
                />
                Analyzing complexity...
              </span>
            ) : (
              <>
                Get Estimate
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
