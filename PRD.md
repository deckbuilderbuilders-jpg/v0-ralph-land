# Ralph Builder - Product Requirements Document

## Document Version
- **Version**: 1.0.0
- **Last Updated**: January 2025
- **Status**: Production Ready

---

## 1. EXECUTIVE SUMMARY

### 1.1 Product Overview
Ralph Builder is an AI-powered no-code application builder that transforms natural language descriptions into fully functional Next.js web applications. Users describe their app idea, answer clarifying questions, review an AI-generated PRD, pay based on complexity, and receive production-ready code with one-click deployment.

### 1.2 Value Proposition
- **For non-technical founders**: Build production apps without coding
- **For developers**: Rapid prototyping and boilerplate generation
- **For agencies**: Scalable client project delivery

### 1.3 Key Differentiators
- Dynamic pricing based on actual complexity analysis
- Iterative build process with validation at each step
- Integrated payment, GitHub, and deployment pipeline
- Framework-aware question generation

---

## 2. TARGET USERS

### 2.1 Primary Personas

| Persona | Description | Needs |
|---------|-------------|-------|
| **Startup Founder** | Non-technical, has idea, limited budget | MVP quickly, affordable, deployable |
| **Solo Developer** | Technical, wants to skip boilerplate | Speed, quality code, best practices |
| **Agency PM** | Manages client projects | Repeatable process, customization |
| **Indie Hacker** | Building side projects | Fast iteration, cheap testing |

### 2.2 User Journey
```
Discovery → Describe App → Clarify → Review PRD → See Estimate → Pay → Build → Deploy
```

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Step 1: Describe App

**Purpose**: Capture initial app idea from user

**Requirements**:
- [x] Multi-line text input (min 20 characters)
- [x] Character count display
- [x] Example prompts for inspiration
- [x] Progress indicator showing Steps Remaining
- [x] Loading state during analysis

**Acceptance Criteria**:
- User can enter app description
- Submit button disabled until minimum length met
- Smooth transition to next step

---

### 3.2 Step 2: Clarify (Dynamic Questions)

**Purpose**: Fill gaps in user's description using appstructure.md framework

**Requirements**:
- [x] AI analyzes description against appstructure.md
- [x] Generates targeted questions (not fixed list)
- [x] Questions categorized by domain (Auth, Data, UI, etc.)
- [x] Priority ordering (must-have → should-have → nice-to-have)
- [x] Users can skip optional questions
- [x] Progress bar with time estimate (~15-30 seconds)

**API Endpoint**: `POST /api/generate-questions`
- Input: `{ description: string }`
- Output: `{ questions: Question[], analysis: Analysis }`

**Acceptance Criteria**:
- Different descriptions produce different questions
- Complex apps get more questions
- Simple apps get fewer questions

---

### 3.3 Step 3: Review PRD

**Purpose**: User reviews and can edit AI-generated requirements

**Requirements**:
- [x] AI generates comprehensive PRD from description + Q&A
- [x] PRD includes: Overview, Features, User Stories, Technical Specs
- [x] Editable markdown content
- [x] Syntax highlighted preview
- [x] Progress bar (~20-40 seconds generation)

**API Endpoint**: `POST /api/generate-prd`
- Input: `{ description: string, questions: Q&A[] }`
- Output: `{ prd: string }`

**PRD Structure**:
```markdown
# App Name

## Overview
## Target Users
## Core Features
## User Stories
## Technical Requirements
## Data Model
## API Endpoints
## UI/UX Requirements
```

**Acceptance Criteria**:
- PRD covers all discussed features
- Users can modify before proceeding
- Changes persist to build phase

---

### 3.4 Step 4: Cost Estimate

**Purpose**: Show transparent, complexity-based pricing

**Requirements**:
- [x] Analyze PRD for features/complexity
- [x] Detect: auth, database, payments, real-time, etc.
- [x] Estimate: pages, components, lines of code
- [x] Calculate: tokens needed, cost breakdown
- [x] Display: feature list, LOC estimate, price

**API Endpoint**: `POST /api/estimate-cost`
- Input: `{ prd: string }`
- Output: `{ estimate: CostEstimate }`

**Pricing Formula**:
```
inputTokens = (PRD length + prompts) × iterations
outputTokens = estimated LOC × 4
baseCost = (input × $3/M) + (output × $15/M)
finalPrice = baseCost × 2.5 margin
minimum = $5.00
```

**Complexity Tiers**:
| Tier | LOC | Iterations | Price Range |
|------|-----|------------|-------------|
| Simple | < 2,000 | 2 | $5-8 |
| Medium | 2,000-5,000 | 4 | $8-15 |
| Complex | 5,000-10,000 | 6 | $15-30 |
| Enterprise | > 10,000 | 8-10 | $30-60+ |

**Acceptance Criteria**:
- Price reflects actual complexity
- Breakdown shows detected features
- User understands what they're paying for

---

### 3.5 Step 5: Approve & Pay

**Purpose**: Secure payment processing via Stripe

**Requirements**:
- [x] Embedded Stripe Checkout (not redirect)
- [x] Dynamic pricing from estimate
- [x] Test mode support (4242...)
- [x] Payment verification before build
- [x] Session stored for verification

**Server Action**: `createCheckoutSession`
- Creates Stripe checkout with dynamic amount
- Returns clientSecret for embedded checkout

**API Endpoint**: `POST /api/verify-payment`
- Verifies session status is 'paid'
- Returns verification result

**Acceptance Criteria**:
- Payment required before build starts
- Stripe handles all card processing
- Clear success/failure states

---

### 3.6 Step 6: Build App

**Purpose**: Iterative AI code generation with progress tracking

**Requirements**:
- [x] Payment verification before each iteration
- [x] PRD + todo list injected into each prompt
- [x] Iteration-specific focus (layout → components → features → polish)
- [x] Real-time streaming output
- [x] File parsing from Claude output
- [x] Syntax validation after each iteration
- [x] Progress bar with time estimate
- [x] Task list showing completion status
- [x] Optional: GitHub sync per iteration
- [x] Live preview panel

**API Endpoint**: `POST /api/build`
- Input: `{ prd, iteration, totalIterations, existingFiles, sessionId }`
- Output: Streaming text with file markers

**File Output Format**:
```
=== FILE: app/page.tsx ===
// file content here
=== END FILE ===
```

**Build Phases**:
| Phase | Focus |
|-------|-------|
| 1 | Layout, globals, page structure |
| 2 | UI components (buttons, cards, forms) |
| 3 | Page sections and content |
| 4 | Interactivity (state, handlers) |
| 5 | API routes (if needed) |
| 6 | Auth integration (if needed) |
| 7 | External integrations |
| 8+ | Polish, fixes, enhancements |

**Acceptance Criteria**:
- All planned iterations complete
- Generated code parses without errors
- Files saved to store
- Progress accurately reflects status

---

### 3.7 Step 7: Download & Deploy

**Purpose**: Deliver completed app to user

**Requirements**:
- [x] ZIP download with all generated files
- [x] Auto-generated: package.json, tsconfig, tailwind config
- [x] Push to GitHub (new repo)
- [x] One-click Vercel deployment
- [x] Display file count, LOC stats

**ZIP Contents**:
```
project-name/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
├── lib/
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.mjs
├── .env.example
├── .gitignore
└── README.md
```

**GitHub Integration**:
- Validate user's Personal Access Token
- Create new public/private repository
- Push all files in single commit
- Return repo URL

**Vercel Integration**:
- Import from GitHub repo
- Auto-detect Next.js framework
- Deploy with default settings
- Return deployment URL

**Acceptance Criteria**:
- ZIP downloads successfully
- GitHub repo created and populated
- Vercel deployment accessible
- Generated app runs locally

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance

| Metric | Target |
|--------|--------|
| Question generation | < 30 seconds |
| PRD generation | < 45 seconds |
| Cost estimation | < 5 seconds |
| Build iteration | < 60 seconds each |
| ZIP generation | < 3 seconds |
| GitHub push | < 10 seconds |
| Vercel deploy | < 2 minutes |

### 4.2 Reliability
- 99.9% uptime for API routes
- Graceful degradation if Claude rate limited
- Retry logic for failed iterations
- Build state recovery on browser refresh

### 4.3 Security
- Stripe handles all payment card data
- GitHub/Vercel tokens never stored server-side
- PRD and code not shared between users
- Row-level security on all database tables

### 4.4 Scalability
- Stateless API routes
- Edge-compatible where possible
- No long-running server processes
- Database handles concurrent users

---

## 5. TECHNICAL ARCHITECTURE

### 5.1 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| State | Zustand |
| Animation | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe |
| AI | Claude via Vercel AI Gateway |
| File Gen | JSZip |
| GitHub | Octokit |
| Email | Resend (optional) |

### 5.2 Database Schema

**Tables**:
- `profiles` - User data linked to auth
- `builds` - Build records with PRD, status, cost
- `build_files` - Generated files per build
- `build_logs` - Iteration logs
- `token_usage` - Token tracking per iteration

**Key Relationships**:
```
profiles (1) ─── (many) builds
builds (1) ─── (many) build_files
builds (1) ─── (many) build_logs
builds (1) ─── (many) token_usage
```

### 5.3 API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/generate-questions` | POST | AI question generation |
| `/api/generate-prd` | POST | AI PRD generation |
| `/api/estimate-cost` | POST | Complexity analysis |
| `/api/build` | POST | Iterative code generation |
| `/api/verify-payment` | POST | Stripe session check |
| `/api/webhook` | POST | Stripe webhook handler |
| `/api/test-code` | POST | Syntax validation |
| `/api/sync-github` | POST | Per-iteration GitHub push |

### 5.4 Server Actions

| Action | Purpose |
|--------|---------|
| `createCheckoutSession` | Create Stripe embedded checkout |
| `getCheckoutSessionStatus` | Verify payment status |
| `validateGitHubToken` | Check PAT validity |
| `createGitHubRepo` | Create new repository |
| `pushToGitHub` | Push files to repo |
| `validateVercelToken` | Check token validity |
| `deployToVercel` | Trigger deployment |
| `getDeploymentStatus` | Check deploy status |

---

## 6. USER INTERFACE

### 6.1 Pages

| Route | Purpose |
|-------|---------|
| `/` | Main wizard interface |
| `/auth/login` | User login |
| `/auth/signup` | User registration |
| `/dashboard` | Build history |
| `/build/[id]` | Individual build details |

### 6.2 Components

**Step Components**:
- `DescribeStep` - Text input with analysis
- `ClarifyStep` - Q&A with categories
- `PrdStep` - Markdown editor/preview
- `EstimateStep` - Cost breakdown display
- `ApproveStep` - Stripe embedded checkout
- `BuildStep` - Progress, tasks, preview
- `DownloadStep` - ZIP, GitHub, Vercel

**Shared Components**:
- `StepIndicator` - Progress visualization
- `StepProgress` - Timer and progress bar
- `ThemeToggle` - Light/dark mode
- `GitHubModal` - Push configuration
- `DeployModal` - Vercel deployment
- `PreviewPanel` - Sandboxed code preview

### 6.3 Design System

**Colors (Dark Mode)**:
- Background: `#0a0a0a`
- Foreground: `#fafafa`
- Primary: `#06b6d4` (cyan)
- Secondary: `#27272a`
- Accent: `#22d3ee`

**Colors (Light Mode)**:
- Background: `#ffffff`
- Foreground: `#0a0a0a`
- Primary: `#0284c7` (blue)
- Secondary: `#f4f4f5`

**Typography**:
- Font: Geist Sans / Geist Mono
- Scale: 12, 14, 16, 18, 20, 24, 30, 36, 48

---

## 7. INTEGRATIONS

### 7.1 Stripe
- Embedded Checkout for payments
- Dynamic pricing
- Webhook for payment confirmation
- Test mode supported

### 7.2 Supabase
- PostgreSQL database
- User authentication
- Row-level security
- Real-time (future)

### 7.3 GitHub
- Repository creation
- File commits
- Per-iteration syncing
- Public/private repos

### 7.4 Vercel
- Deployment from GitHub
- Auto-detection of Next.js
- Environment variables (manual)
- Deployment status tracking

### 7.5 Claude (via Vercel AI Gateway)
- Question generation
- PRD generation
- Code generation
- Context-aware prompts

---

## 8. DATA FLOW

### 8.1 Build Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Description │────▶│  Questions  │────▶│    PRD      │
│    Input     │     │  (Claude)   │     │  (Claude)   │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Deploy    │◀────│    Build    │◀────│   Payment   │
│   (Vercel)  │     │  (Iterate)  │     │  (Stripe)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 8.2 State Management

```
useAppStore (Zustand)
├── step (1-7)
├── appDescription
├── questions[]
├── answers{}
├── prd
├── costEstimate
├── buildContext
│   ├── prd
│   ├── todos[]
│   └── iterationResults[]
├── generatedFiles[]
├── stripeSessionId
├── paymentVerified
├── githubConfig
└── deploymentUrl
```

---

## 9. ERROR HANDLING

### 9.1 Error Categories

| Category | Example | Handling |
|----------|---------|----------|
| Input Validation | Description too short | Client-side message |
| API Failure | Claude timeout | Retry with backoff |
| Payment Failure | Card declined | Stripe handles UI |
| Build Failure | Parse error | Log, allow retry |
| Deploy Failure | GitHub rate limit | Show error, manual retry |

### 9.2 Recovery Mechanisms
- Build state stored in Zustand + localStorage
- Browser refresh doesn't lose progress
- Failed iterations can be retried
- Partial builds can be downloaded

---

## 10. FUTURE ENHANCEMENTS

### 10.1 Planned (P1)
- [ ] Template library (SaaS, E-commerce, Blog starters)
- [ ] Self-healing builds (auto-fix on test failure)
- [ ] Inline code editor before download

### 10.2 Considered (P2)
- [ ] Subscription pricing (monthly credits)
- [ ] Team accounts
- [ ] Version control for PRDs
- [ ] Mobile app support

### 10.3 Backlog (P3)
- [ ] White-label for agencies
- [ ] Custom component library support
- [ ] AI design mockups before build
- [ ] Multi-language support

---

## 11. SUCCESS METRICS

### 11.1 KPIs

| Metric | Target |
|--------|--------|
| Build completion rate | > 90% |
| Average build time | < 5 minutes |
| User satisfaction (NPS) | > 50 |
| Return user rate | > 30% |
| Revenue per user | > $15 |

### 11.2 Quality Metrics

| Metric | Target |
|--------|--------|
| Generated code passes lint | > 95% |
| Apps deploy successfully | > 90% |
| No runtime errors on load | > 85% |

---

## 12. APPENDIX

### 12.1 File Inventory

**Core Files**: 25
**API Routes**: 8
**Components**: 15
**Library Functions**: 45
**Database Tables**: 5

### 12.2 Environment Variables

| Variable | Required | Source |
|----------|----------|--------|
| `STRIPE_SECRET_KEY` | Yes | Stripe Integration |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Integration |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Integration |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Integration |
| `RESEND_API_KEY` | No | Manual |

### 12.3 Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2025 | Initial production release |

---

*This PRD serves as the source of truth for Ralph Builder. Any agent or developer working on this project should compare their implementation against this document.*
