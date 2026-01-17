"use client"

import { motion } from "framer-motion"
import {
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Zap,
  Clock,
  Layers,
  Code,
  FileText,
  Database,
  CreditCard,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"

export function EstimateStep() {
  const { costEstimate, setStep } = useAppStore()

  if (!costEstimate) return null

  const { analysis, pricing, estimates } = costEstimate

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
          <DollarSign className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3">Cost Estimate</h2>
        <p className="text-muted-foreground">Transparent pricing based on your app complexity</p>
      </div>

      <div className="space-y-6">
        {/* Main pricing card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Complexity Level</p>
              <p className="text-xl font-semibold capitalize">{costEstimate.label}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Estimated Cost</p>
              <p className="text-3xl font-bold text-primary">${pricing.totalCost.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
              <Layers className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Iterations</p>
              <p className="font-semibold">{estimates.iterations}</p>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
              <Zap className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Tokens</p>
              <p className="font-semibold">{(estimates.totalTokens / 1000).toFixed(0)}k</p>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
              <Clock className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Est. Time</p>
              <p className="font-semibold">{estimates.iterations * 2}min</p>
            </div>
          </div>
        </motion.div>

        {/* Analysis breakdown */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-card border border-border"
          >
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />
              Detected Requirements
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Pages
                </span>
                <span className="font-medium">{analysis.pages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Components
                </span>
                <span className="font-medium">{analysis.components}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Code className="h-3 w-3" /> Est. Lines
                </span>
                <span className="font-medium">{analysis.estimatedLinesOfCode.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Features
                </span>
                <span className="font-medium">
                  {
                    Object.values(analysis.features).filter((v) => v === true || (typeof v === "number" && v > 0))
                      .length
                  }
                </span>
              </div>
            </div>

            {/* Feature tags */}
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
              {analysis.features.authentication && (
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Auth
                </span>
              )}
              {analysis.features.database && (
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs flex items-center gap-1">
                  <Database className="h-3 w-3" /> Database
                </span>
              )}
              {analysis.features.payments && (
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> Payments
                </span>
              )}
              {analysis.features.realtime && (
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">Realtime</span>
              )}
              {analysis.features.fileUpload && (
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">File Upload</span>
              )}
              {analysis.features.apiIntegrations > 0 && (
                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                  {analysis.features.apiIntegrations} API{analysis.features.apiIntegrations > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Token cost breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-secondary/30 border border-border text-sm"
        >
          <h3 className="font-medium mb-2">Cost Breakdown</h3>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Input tokens ({estimates.inputTokens?.toLocaleString() || "~"})</span>
              <span>${pricing.inputCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Output tokens ({estimates.outputTokens?.toLocaleString() || "~"})</span>
              <span>${pricing.outputCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border text-foreground font-medium">
              <span>Total</span>
              <span>${pricing.totalCost.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-400">
            No surprises - this is the maximum cost. You only pay for what&apos;s used.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep("prd")} className="flex-1 h-12">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={() => setStep("approve")} className="flex-1 h-12">
            Proceed to Payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
