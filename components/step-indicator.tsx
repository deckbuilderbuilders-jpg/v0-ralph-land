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
    <nav aria-label="Build progress" className="py-4 md:py-8 overflow-x-auto">
      <ol className="flex items-center justify-start md:justify-center gap-1 md:gap-2 min-w-max px-4 md:px-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex

          return (
            <li key={step.id} className="flex items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all duration-300",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary bg-primary/10 text-primary",
                  !isCompleted && !isCurrent && "border-border text-muted-foreground",
                )}
                aria-current={isCurrent ? "step" : undefined}
                role="listitem"
              >
                {isCompleted ? <Check className="h-3 w-3 md:h-4 md:w-4" /> : step.icon}
                <span className="sr-only">
                  {step.label} {isCompleted ? "(completed)" : isCurrent ? "(current)" : ""}
                </span>
              </motion.div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-4 md:w-8 h-0.5 mx-0.5 md:mx-1 transition-colors duration-300",
                    index < currentIndex ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
      <div className="text-center mt-2 md:hidden">
        <span className="text-sm font-medium text-primary">{steps[currentIndex]?.label}</span>
        <span className="text-sm text-muted-foreground">
          {" "}
          ({currentIndex + 1}/{steps.length})
        </span>
      </div>
    </nav>
  )
}
