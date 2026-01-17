# Ralph Builder

AI-powered no-code app builder using Claude for code generation and Stripe for payments.

---

## Current Status: PRODUCTION READY

The app is fully functional with:
- End-to-end build pipeline
- Payment processing via Stripe
- GitHub integration
- Live preview
- One-click Vercel deployment

---

## Features

### Core Build Loop
1. **Describe** - User describes their app idea
2. **Clarify** - AI asks strategic follow-up questions
3. **PRD** - AI generates full product requirements document
4. **Estimate** - Dynamic pricing based on complexity analysis
5. **Pay** - Stripe embedded checkout
6. **Build** - Iterative code generation with progress tracking
7. **Deploy** - Preview, download ZIP, push to GitHub, deploy to Vercel

### Code Testing & Validation
- Syntax checking (brackets, quotes)
- Import validation
- Placeholder detection
- Live preview in sandboxed iframe

### One-Click Deployment
- Push to GitHub (new repo creation)
- Deploy to Vercel directly from GitHub
- Live URL in ~2 minutes

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    RALPH BUILDER PIPELINE                        │
└─────────────────────────────────────────────────────────────────┘

User Input → Generate Questions (Claude)
    ↓
Answers → Generate PRD (Claude)  
    ↓
PRD → Analyze Complexity → Estimate Cost
    ↓
Payment (Stripe Embedded Checkout)
    ↓
Verify Payment (Server-side)
    ↓
Build Loop:
    ├─ Generate code iteration (Claude)
    ├─ Parse files from output
    ├─ Validate syntax
    ├─ Update progress
    └─ Repeat for N iterations
    ↓
Download ZIP / Push to GitHub / Deploy to Vercel
```

---

## File Structure

```
app/
├── page.tsx                    # Main wizard controller
├── layout.tsx                  # App layout
├── actions/
│   ├── stripe.ts               # Stripe checkout session
│   ├── github.ts               # GitHub repo creation & push
│   └── vercel.ts               # Vercel deployment
└── api/
    ├── generate-questions/     # AI question generation
    ├── generate-prd/           # AI PRD generation
    ├── estimate-cost/          # Token/cost estimation
    ├── build/                  # Iterative code generation
    ├── test-code/              # Code validation
    ├── sync-github/            # Per-iteration GitHub sync
    ├── verify-payment/         # Payment verification
    └── webhook/                # Stripe webhooks

components/
├── step-indicator.tsx          # Progress steps
├── github-modal.tsx            # GitHub push modal
├── deploy-modal.tsx            # Vercel deploy modal
├── preview-panel.tsx           # Live code preview
└── steps/
    ├── describe-step.tsx       # App description input
    ├── clarify-step.tsx        # Q&A interface
    ├── prd-step.tsx            # PRD review/edit
    ├── estimate-step.tsx       # Cost breakdown
    ├── approve-step.tsx        # Payment checkout
    ├── build-step.tsx          # Build progress
    └── download-step.tsx       # Final delivery

lib/
├── store.ts                    # Zustand state management
├── stripe.ts                   # Stripe client
├── token-estimation.ts         # Complexity analysis
├── file-parser.ts              # Parse Claude output
├── zip-generator.ts            # ZIP file creation
├── code-tester.ts              # Syntax validation
└── build-context.ts            # PRD + todo injection
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Stripe server key | Auto-configured |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client key | Auto-configured |

User-provided (at runtime):
- GitHub Personal Access Token (for push)
- Vercel Token (for deployment)

---

## Quick Start

1. **Test Payment**: Use card `4242 4242 4242 4242`
2. **GitHub Push**: Create token at github.com/settings/tokens with `repo` scope
3. **Vercel Deploy**: Create token at vercel.com/account/tokens

---

## Pricing Model

| Complexity | LOC | Iterations | Price Range |
|------------|-----|------------|-------------|
| Simple | < 2,000 | 2 | $5-8 |
| Medium | 2-5,000 | 4 | $8-15 |
| Complex | 5-10,000 | 6 | $15-30 |
| Enterprise | > 10,000 | 10 | $30-60+ |

Formula: `(Input tokens × $3/M) + (Output tokens × $15/M) × 2.5 margin`
