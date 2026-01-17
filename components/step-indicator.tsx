"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Check, Sparkles, FileText, DollarSign, CreditCard, Hammer, Download } from "lucide-react"
import { useAppStore, type Step } from "@/lib/store"
import { cn } from "@/lib/utils"

const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "describe", label: "Describe", icon: <Sparkles className="h-4 w-4" /> },
  { id: "clarify", label: "Clarify", icon: <FileText className="h-4 w-4" /> },
  { id: "prd", label: "Review", icon: <FileText className="h-4 w-4" /> },
  { id: "estimate", label: "Estimate", icon: <DollarSign className="h-4 w-4" /> },
  { id: "approve", label: "Approve", icon: <CreditCard className="h-4 w-4" /> },
  { id: "build", label: "Build", icon: <Hammer className="h-4 w-4" /> },
  { id: "download", label: "Download", icon: <Download className="h-4 w-4" /> },
]

const stepOrder: Step[] = ["describe", "clarify", "prd", "estimate", "approve", "build", "download"]

export function StepIndicator() {
  const currentStep = useAppStore((state) => state.currentStep)
  const currentIndex = stepOrder.indexOf(currentStep)

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex

        return (
          <div key={step.id} className="flex items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                isCompleted && "bg-primary border-primary text-primary-foreground",
                isCurrent && "border-primary bg-primary/10 text-primary",
                !isCompleted && !isCurrent && "border-border text-muted-foreground",
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : step.icon}
            </motion.div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 mx-1 transition-colors duration-300",
                  index < currentIndex ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
