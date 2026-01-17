"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/lib/store"

const exampleApps = [
  "A todo list app that syncs across devices",
  "An e-commerce store for selling digital products",
  "A real-time chat application for teams",
  "A recipe sharing platform with user profiles",
]

export function DescribeStep() {
  const {
    appDescription,
    setAppDescription,
    setStep,
    setQuestions,
    setIsLoading,
    isLoading,
    setQuestionAnalysis,
    setQuestionCategories,
  } = useAppStore()
  const [localDescription, setLocalDescription] = useState(appDescription)

  const handleContinue = async () => {
    if (!localDescription.trim()) return

    setAppDescription(localDescription)
    setIsLoading(true)

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appDescription: localDescription }),
      })

      if (!response.ok) throw new Error("Failed to generate questions")

      const data = await response.json()
      setQuestions(data.questions)
      if (data.analysis) {
        setQuestionAnalysis(data.analysis)
      }
      if (data.categories) {
        setQuestionCategories(data.categories)
      }
      setStep("clarify")
    } catch {
      console.error("Error generating questions")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6"
        >
          <Sparkles className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3 text-balance">What do you want to build?</h2>
        <p className="text-muted-foreground">Describe your app idea in plain English. Be as detailed as you like.</p>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="Describe your app idea here..."
          value={localDescription}
          onChange={(e) => setLocalDescription(e.target.value)}
          className="min-h-[160px] text-base bg-card border-border resize-none"
        />

        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Lightbulb className="h-3 w-3" /> Try:
          </span>
          {exampleApps.map((example) => (
            <button
              key={example}
              onClick={() => setLocalDescription(example)}
              className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!localDescription.trim() || isLoading}
          className="w-full h-12 text-base"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="h-5 w-5 border-2 border-current border-t-transparent rounded-full"
            />
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
