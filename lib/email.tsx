// Email service for sending build receipts using Resend
// Note: Requires RESEND_API_KEY environment variable

interface BuildReceiptData {
  userEmail: string
  userName?: string
  appName: string
  buildId: string
  totalCost: number
  estimatedCost: number
  tokensUsed: { input: number; output: number }
  filesGenerated: number
  linesOfCode: number
  githubUrl?: string
  vercelUrl?: string
  completedAt: Date
}

export async function sendBuildReceipt(data: BuildReceiptData): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.log("RESEND_API_KEY not set, skipping email")
    return false
  }

  const tokenSavings = data.estimatedCost - data.totalCost
  const savingsPercent = data.estimatedCost > 0 ? ((tokenSavings / data.estimatedCost) * 100).toFixed(0) : 0

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your app is ready!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0b; color: #fafafa; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #22d3ee; font-size: 24px; margin: 0;">Ralph Builder</h1>
    </div>
    
    <div style="background-color: #18181b; border-radius: 12px; padding: 32px; border: 1px solid #27272a;">
      <h2 style="margin: 0 0 8px 0; font-size: 20px;">Your app is ready! 🎉</h2>
      <p style="color: #a1a1aa; margin: 0 0 24px 0;">
        Hi${data.userName ? ` ${data.userName}` : ""}, your <strong style="color: #fafafa;">${data.appName}</strong> has been successfully generated.
      </p>
      
      <div style="background-color: #27272a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px;">Build Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa;">Files Generated</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.filesGenerated}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa;">Lines of Code</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.linesOfCode.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa;">Tokens Used</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${(data.tokensUsed.input + data.tokensUsed.output).toLocaleString()}</td>
          </tr>
          <tr style="border-top: 1px solid #3f3f46;">
            <td style="padding: 12px 0 0 0; color: #a1a1aa;">Estimated Cost</td>
            <td style="padding: 12px 0 0 0; text-align: right; text-decoration: line-through; color: #71717a;">$${data.estimatedCost.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #a1a1aa;">Actual Cost</td>
            <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #22c55e;">$${data.totalCost.toFixed(2)}</td>
          </tr>
          ${
            tokenSavings > 0
              ? `
          <tr>
            <td style="padding: 4px 0; color: #22c55e;">You Saved</td>
            <td style="padding: 4px 0; text-align: right; color: #22c55e;">$${tokenSavings.toFixed(2)} (${savingsPercent}%)</td>
          </tr>
          `
              : ""
          }
        </table>
      </div>
      
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        ${
          data.githubUrl
            ? `
        <a href="${data.githubUrl}" style="display: inline-block; background-color: #27272a; color: #fafafa; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 500;">
          View on GitHub →
        </a>
        `
            : ""
        }
        ${
          data.vercelUrl
            ? `
        <a href="${data.vercelUrl}" style="display: inline-block; background-color: #22d3ee; color: #0a0a0b; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 500;">
          Visit Live Site →
        </a>
        `
            : ""
        }
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 32px; color: #71717a; font-size: 12px;">
      <p style="margin: 0 0 8px 0;">Build ID: ${data.buildId}</p>
      <p style="margin: 0 0 8px 0;">Completed: ${data.completedAt.toLocaleDateString()} at ${data.completedAt.toLocaleTimeString()}</p>
      <p style="margin: 0;">
        <a href="https://ralphbuilder.com/dashboard" style="color: #22d3ee; text-decoration: none;">View all your builds →</a>
      </p>
    </div>
  </div>
</body>
</html>
`

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ralph Builder <builds@ralphbuilder.com>",
        to: data.userEmail,
        subject: `Your ${data.appName} is ready! 🎉`,
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Failed to send email:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Email send error:", error)
    return false
  }
}

export async function sendPaymentReceipt(
  userEmail: string,
  userName: string | undefined,
  appName: string,
  amount: number,
  stripeReceiptUrl?: string,
): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.log("RESEND_API_KEY not set, skipping email")
    return false
  }

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Confirmed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0b; color: #fafafa; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #22d3ee; font-size: 24px; margin: 0;">Ralph Builder</h1>
    </div>
    
    <div style="background-color: #18181b; border-radius: 12px; padding: 32px; border: 1px solid #27272a;">
      <h2 style="margin: 0 0 8px 0; font-size: 20px;">Payment Confirmed ✓</h2>
      <p style="color: #a1a1aa; margin: 0 0 24px 0;">
        Hi${userName ? ` ${userName}` : ""}, your payment of <strong style="color: #22c55e;">$${amount.toFixed(2)}</strong> for <strong style="color: #fafafa;">${appName}</strong> has been received.
      </p>
      
      <p style="color: #a1a1aa; margin: 0 0 16px 0;">
        Your app build is now in progress. We'll email you again when it's ready!
      </p>
      
      ${
        stripeReceiptUrl
          ? `
      <a href="${stripeReceiptUrl}" style="display: inline-block; background-color: #27272a; color: #fafafa; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 500;">
        View Receipt →
      </a>
      `
          : ""
      }
    </div>
  </div>
</body>
</html>
`

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ralph Builder <payments@ralphbuilder.com>",
        to: userEmail,
        subject: `Payment confirmed for ${appName}`,
        html: emailHtml,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Email send error:", error)
    return false
  }
}
