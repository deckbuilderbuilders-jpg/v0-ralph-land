"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { CreditCard, ArrowLeft, Lock, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { createCheckoutSession, getCheckoutSessionStatus } from "@/app/actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function ApproveStep() {
  const { costEstimate, prd, setStep, setIsLoading, setPaymentVerification, setStripeSessionId } = useAppStore()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    if (!costEstimate) return

    try {
      const { clientSecret, sessionId } = await createCheckoutSession({
        amount: costEstimate.pricing.totalCost,
        productName: `Ralph Builder - ${costEstimate.label}`,
        description: `AI-powered app generation (${costEstimate.estimates.iterations} iterations, ~${Math.round(costEstimate.estimates.totalTokens / 1000)}k tokens)`,
        metadata: {
          complexity: costEstimate.complexity,
          iterations: String(costEstimate.estimates.iterations),
          tokens: String(costEstimate.estimates.totalTokens),
        },
      })

      setClientSecret(clientSecret)
      setSessionId(sessionId)
      setStripeSessionId(sessionId)
    } catch (err) {
      console.error("Failed to create checkout session:", err)
      setError("Failed to initialize payment. Please try again.")
    }
  }, [costEstimate, setStripeSessionId])

  useEffect(() => {
    if (costEstimate && !clientSecret) {
      fetchClientSecret()
    }
  }, [costEstimate, clientSecret, fetchClientSecret])

  const handleComplete = useCallback(async () => {
    if (!sessionId) return

    setPaymentStatus("processing")

    try {
      const status = await getCheckoutSessionStatus(sessionId)

      if (status.paymentStatus === "paid") {
        const verifyResponse = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })

        const verification = await verifyResponse.json()

        if (verification.verified) {
          setPaymentVerification({
            verified: true,
            sessionId: sessionId,
            amountPaid: verification.amountPaid,
            customerEmail: verification.customerEmail,
          })

          setPaymentStatus("success")
          setIsLoading(false)
          setTimeout(() => setStep("build"), 1500)
        } else {
          setPaymentStatus("error")
          setError("Payment verification failed. Please contact support.")
        }
      } else {
        setPaymentStatus("error")
        setError("Payment was not completed. Please try again.")
      }
    } catch (err) {
      console.error("Failed to verify payment:", err)
      setPaymentStatus("error")
      setError("Failed to verify payment status.")
    }
  }, [sessionId, setStep, setIsLoading, setPaymentVerification])

  if (!costEstimate) return null

  if (paymentStatus === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6"
        >
          <CheckCircle className="h-10 w-10 text-green-500" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-muted-foreground">Starting your build...</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6"
        >
          <CreditCard className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3">Approve & Pay</h2>
        <p className="text-muted-foreground">Confirm your order to start building</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
            <span className="text-muted-foreground">App Build</span>
            <span className="font-medium">{costEstimate.label}</span>
          </div>
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
            <span className="text-muted-foreground">Iterations</span>
            <span className="font-medium">Up to {costEstimate.estimates.iterations}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">${costEstimate.pricing.totalCost.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {clientSecret ? (
          <div className="rounded-xl overflow-hidden border border-border">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret, onComplete: handleComplete }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-card border border-border flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        )}

        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Lock className="h-4 w-4" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>Stripe Encrypted</span>
          </div>
        </div>

        <Button variant="outline" onClick={() => setStep("estimate")} className="w-full h-12">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Estimate
        </Button>
      </div>
    </motion.div>
  )
}
