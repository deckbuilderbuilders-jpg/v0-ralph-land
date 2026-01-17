"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  FileText,
  DollarSign,
  CreditCard,
  Cog,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface OnboardingTourProps {
  onComplete: () => void
}

const tourSteps = [
  {
    icon: Sparkles,
    title: "Welcome to Ralph Builder!",
    description: "Build production-ready web apps without writing code. Let's walk through how it works.",
    tip: "This tour takes about 1 minute. You can skip it anytime.",
  },
  {
    icon: MessageSquare,
    title: "Step 1: Describe Your App",
    description:
      "Start by describing your app idea in plain English. Be as detailed as you like - the more context, the better.",
    tip: "Example: 'A task management app with team collaboration, due dates, and priority levels.'",
  },
  {
    icon: MessageSquare,
    title: "Step 2: Answer Questions",
    description:
      "Our AI will ask clarifying questions to fully understand your requirements. This ensures we build exactly what you need.",
    tip: "Take your time here - good answers lead to better apps.",
  },
  {
    icon: FileText,
    title: "Step 3: Review Your PRD",
    description:
      "We generate a detailed Product Requirements Document. Review it and make any edits before proceeding.",
    tip: "You can edit the PRD directly if anything needs changing.",
  },
  {
    icon: DollarSign,
    title: "Step 4: Cost Estimate",
    description: "See a transparent breakdown of the build cost based on app complexity. Prices range from $5-$60+.",
    tip: "Simple apps cost less, complex apps with auth/payments cost more.",
  },
  {
    icon: CreditCard,
    title: "Step 5: Secure Payment",
    description: "Pay securely via Stripe. Your payment is processed before we start building.",
    tip: "We use Stripe for secure, encrypted payment processing.",
  },
  {
    icon: Cog,
    title: "Step 6: Watch It Build",
    description: "See your app come to life in real-time. Our AI generates code iteration by iteration.",
    tip: "Build times range from 5-15 minutes depending on complexity.",
  },
  {
    icon: Download,
    title: "Step 7: Deploy!",
    description: "Download your code, push to GitHub, and deploy to Vercel with one click. You're live!",
    tip: "Your code is yours forever - no lock-in.",
  },
]

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = tourSteps[currentStep]
  const Icon = step.icon

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="w-full max-w-lg mx-4">
            <CardContent className="p-6">
              {/* Close button */}
              <button
                onClick={onComplete}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close tour"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mb-6">
                {tourSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentStep ? "bg-primary" : i < currentStep ? "bg-primary/50" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">{step.title}</h2>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>{step.tip}</span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={handlePrev} disabled={currentStep === 0} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentStep + 1} of {tourSteps.length}
                </span>
                <Button onClick={handleNext} className="gap-2">
                  {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
