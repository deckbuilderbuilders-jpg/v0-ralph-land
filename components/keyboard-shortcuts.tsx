"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Keyboard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore, type Step } from "@/lib/store"

const shortcuts = [
  { keys: ["?"], description: "Show keyboard shortcuts" },
  { keys: ["Esc"], description: "Close dialogs / Cancel" },
  { keys: ["1-7"], description: "Jump to step (if available)" },
  { keys: ["Enter"], description: "Submit / Continue" },
  { keys: ["Ctrl", "S"], description: "Save progress" },
  { keys: ["Ctrl", "R"], description: "Reset and start over" },
  { keys: ["D"], description: "Toggle dark mode" },
]

const stepMap: Record<string, Step> = {
  "1": "describe",
  "2": "clarify",
  "3": "prd",
  "4": "estimate",
  "5": "approve",
  "6": "build",
  "7": "download",
}

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false)
  const setStep = useAppStore((state) => state.setStep)
  const currentStep = useAppStore((state) => state.currentStep)
  const reset = useAppStore((state) => state.reset)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Show help with ?
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setShowHelp(true)
        return
      }

      // Close dialogs with Escape
      if (e.key === "Escape") {
        setShowHelp(false)
        return
      }

      // Toggle dark mode with D
      if (e.key === "d" || e.key === "D") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          document.documentElement.classList.toggle("dark")
          const isDark = document.documentElement.classList.contains("dark")
          localStorage.setItem("ralph-theme", isDark ? "dark" : "light")
        }
        return
      }

      // Jump to step with 1-7
      if (/^[1-7]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
        const targetStep = stepMap[e.key]
        // Only allow jumping to steps that are before or equal to current progress
        const stepOrder: Step[] = ["describe", "clarify", "prd", "estimate", "approve", "build", "download"]
        const currentIndex = stepOrder.indexOf(currentStep)
        const targetIndex = stepOrder.indexOf(targetStep)
        if (targetIndex <= currentIndex) {
          setStep(targetStep)
        }
        return
      }

      // Reset with Ctrl+R
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault()
        if (confirm("Are you sure you want to reset and start over?")) {
          reset()
        }
        return
      }

      // Save progress with Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        // Progress is auto-saved to store, show confirmation
        const notification = document.createElement("div")
        notification.className =
          "fixed bottom-4 right-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2"
        notification.textContent = "Progress saved!"
        document.body.appendChild(notification)
        setTimeout(() => notification.remove(), 2000)
        return
      }
    },
    [currentStep, setStep, reset],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <AnimatePresence>
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="relative">
                <button
                  onClick={() => setShowHelp(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Keyboard className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Keyboard Shortcuts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {shortcuts.map((shortcut) => (
                    <div key={shortcut.description} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, i) => (
                          <span key={key}>
                            <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">{key}</kbd>
                            {i < shortcut.keys.length - 1 && <span className="text-muted-foreground mx-1">+</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Esc</kbd> to close
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
