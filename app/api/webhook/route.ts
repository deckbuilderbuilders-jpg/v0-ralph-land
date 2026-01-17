import { type NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe"

// Store verified sessions in memory (in production, use a database)
// This is exported so build-step can check it
export const verifiedSessions = new Set<string>()

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // For webhook verification, you need to set STRIPE_WEBHOOK_SECRET
    // In development/testing, we can skip verification
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // Development mode - parse without verification
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.payment_status === "paid") {
        // Mark this session as verified for build access
        verifiedSessions.add(session.id)
        console.log(`[Webhook] Payment verified for session: ${session.id}`)

        // In production, you would:
        // 1. Store in database
        // 2. Trigger build process
        // 3. Send confirmation email
      }
      break
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session
      console.log(`[Webhook] Session expired: ${session.id}`)
      break
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log(`[Webhook] Payment failed: ${paymentIntent.id}`)
      break
    }

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
