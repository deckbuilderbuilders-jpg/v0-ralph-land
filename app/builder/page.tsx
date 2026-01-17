"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { StepIndicator } from "@/components/step-indicator"
import { DescribeStep } from "@/components/steps/describe-step"
import { ClarifyStep } from "@/components/steps/clarify-step"
import { PrdStep } from "@/components/steps/prd-step"
import { EstimateStep } from "@/components/steps/estimate-step"
import { ApproveStep } from "@/components/steps/approve-step"
import { BuildStep } from "@/components/steps/build-step"
import { DownloadStep } from "@/components/steps/download-step"
import { ThemeToggle } from "@/components/theme-toggle"
import { OnboardingTour } from "@/components/onboarding-tour"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import Link from "next/link"

export default function BuilderPage() {
  const currentStep = useAppStore((state) => state.currentStep)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("ralph-onboarding-complete")
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem("ralph-onboarding-complete", "true")
    setShowOnboarding(false)
  }

  const renderStep = () => {
    switch (currentStep) {
      case "describe":
        return <DescribeStep />
      case "clarify":
        return <ClarifyStep />
      case "prd":
        return <PrdStep />
      case "estimate":
        return <EstimateStep />
      case "approve":
        return <ApproveStep />
      case "build":
        return <BuildStep />
      case "download":
        return <DownloadStep />
      default:
        return <DescribeStep />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Keyboard shortcuts handler */}
      <KeyboardShortcuts />

      {/* Onboarding tour */}
      {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}

      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold">Ralph Builder</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <button onClick={() => setShowOnboarding(true)} className="hover:text-foreground transition-colors">
                Help
              </button>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <StepIndicator />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="py-8"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>Built with the Ralph Wiggum Technique and Claude AI</p>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Shortcuts:</span>
            <kbd className="px-2 py-1 rounded bg-muted text-xs">?</kbd>
            <span className="text-xs">for help</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
