import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    // Retrieve the session from Stripe to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const isVerified = session.payment_status === "paid" && session.status === "complete"

    return NextResponse.json({
      verified: isVerified,
      paymentStatus: session.payment_status,
      sessionStatus: session.status,
      amountPaid: session.amount_total ? session.amount_total / 100 : 0,
      customerEmail: session.customer_details?.email,
      metadata: session.metadata,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
