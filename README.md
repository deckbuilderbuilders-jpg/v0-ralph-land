# Ralph Builder

AI-powered no-code app builder using Claude for code generation and Stripe for payments.

---

## Current Status: PRODUCTION READY (100% PRD Compliance)

The app is fully functional with:
- End-to-end build pipeline
- Payment processing via Stripe
- GitHub integration
- Live preview
- One-click Vercel deployment
- Marketing landing page
- Onboarding tour
- Keyboard shortcuts
- Full mobile responsiveness
- WCAG 2.1 AA accessibility

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

### User Experience
- **Onboarding Tour**: 8-step guided introduction for new users
- **Keyboard Shortcuts**: Press `?` to see all shortcuts
- **Mobile Responsive**: Full functionality on all devices
- **Accessible**: WCAG 2.1 AA compliant with screen reader support

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    RALPH BUILDER PIPELINE                        │
└─────────────────────────────────────────────────────────────────┘

Landing Page (/) → Builder (/builder)
    ↓
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
├── (marketing)/page.tsx        # Landing page
├── builder/page.tsx            # Main wizard controller
├── dashboard/page.tsx          # User build history
├── auth/
│   ├── login/page.tsx          # Login form
│   └── signup/page.tsx         # Signup form
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
├── step-progress.tsx           # Time estimate progress bar
├── github-modal.tsx            # GitHub push modal
├── deploy-modal.tsx            # Vercel deploy modal
├── preview-panel.tsx           # Live code preview
├── theme-toggle.tsx            # Light/dark mode
├── onboarding-tour.tsx         # New user guide
├── keyboard-shortcuts.tsx      # Shortcut handler
├── error-boundary.tsx          # Error recovery
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
├── build-context.ts            # PRD + todo injection
├── question-generator.ts       # Dynamic question generation
├── error-recovery.ts           # Build recovery utilities
└── supabase/                   # Supabase clients
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Show keyboard shortcuts |
| `Esc` | Close dialogs |
| `1-7` | Jump to step (if available) |
| `Enter` | Submit / Continue |
| `Ctrl+S` | Save progress |
| `Ctrl+R` | Reset and start over |
| `D` | Toggle dark mode |

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Stripe server key | Auto-configured |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client key | Auto-configured |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | Auto-configured |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Auto-configured |

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

---

## Accessibility

Ralph Builder is WCAG 2.1 AA compliant:
- Skip to main content link
- Full keyboard navigation
- Screen reader support with ARIA labels
- Focus indicators on all interactive elements
- Reduced motion support for users who prefer it
- Minimum 44px touch targets on mobile
