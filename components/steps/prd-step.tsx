"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, ArrowRight, ArrowLeft, Edit3, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/lib/store"
import { StepProgress, STEP_ESTIMATES } from "@/components/step-progress"

export function PrdStep() {
  const { prd, setPrd, setStep, setCostEstimate, setIsLoading, isLoading } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editedPrd, setEditedPrd] = useState(prd)

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
            <pre className="text-sm whitespace-pre-wrap font-mono text-foreground/90">{prd}</pre>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep("clarify")} className="flex-1 h-12" disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleContinue} disabled={isLoading} className="flex-1 h-12">
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
