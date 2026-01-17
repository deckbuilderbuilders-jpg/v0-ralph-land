# Ralph Builder - Admin Function Registry

## Overview
Complete inventory of all functions and components in the Ralph Builder codebase.

---

## STATUS LEGEND
- **LIVE** - Fully implemented and functional
- **PLACEHOLDER** - Mock/simulated data
- **TODO** - Not yet implemented

---

## LIBRARY FUNCTIONS

### `/lib/store.ts` - Zustand State Management
| Function | Status | Description |
|----------|--------|-------------|
| `useAppStore` | LIVE | Main Zustand store hook |
| `setStep` | LIVE | Navigate between wizard steps |
| `setAppDescription` | LIVE | Store user's app description |
| `setQuestions` | LIVE | Store generated clarifying questions |
| `setAnswer` | LIVE | Store user answers to questions |
| `setPrd` | LIVE | Store generated PRD |
| `setCostEstimate` | LIVE | Store cost estimate data |
| `addBuildLog` | LIVE | Add entry to build log |
| `setBuildProgress` | LIVE | Update build progress percentage |
| `setGeneratedCode` | LIVE | Store AI-generated code output |
| `setGeneratedFiles` | LIVE | Store parsed file objects |
| `setBuildContext` | LIVE | Store build context with PRD and todos |
| `updateTodoItem` | LIVE | Update individual task status |
| `addIterationResult` | LIVE | Add iteration result to history |
| `setCurrentTestResult` | LIVE | Store code validation results |
| `setPreviewHTML` | LIVE | Store HTML preview string |
| `setGitHubConfig` | LIVE | Store GitHub settings |
| `setLastGithubSync` | LIVE | Store last commit info |
| `setQuestionAnalysis` | LIVE | Store AI analysis of user input |
| `setQuestionCategories` | LIVE | Store categorized questions |
| `setTokenUsage` | LIVE | Store estimated/actual token usage |
| `updateActualTokens` | LIVE | Increment actual token counts |
| `setBuildId` | LIVE | Store database build ID |
| `setUserId` | LIVE | Store authenticated user ID |
| `setIsLoading` | LIVE | Toggle loading state |
| `setError` | LIVE | Set error message |
| `setStripeSessionId` | LIVE | Store Stripe session ID |
| `setPaymentVerification` | LIVE | Store payment verification result |
| `reset` | LIVE | Reset entire store to initial state |

### `/lib/token-estimation.ts` - Token & Cost Calculation
| Function | Status | Description |
|----------|--------|-------------|
| `analyzeComplexity` | LIVE | Parses PRD to detect features via regex patterns |
| `estimateTokens` | LIVE | Calculates input/output token estimates |
| `calculatePricing` | LIVE | Computes cost with Claude pricing + margin |
| `getComplexityLabel` | LIVE | Returns human-readable complexity tier |

### `/lib/question-generator.ts` - Dynamic Question Generation
| Function | Status | Description |
|----------|--------|-------------|
| `analyzeAndGenerateQuestions` | LIVE | Compares user input to appstructure.md framework |
| `flattenQuestions` | LIVE | Flattens categorized questions into array |

### `/lib/stripe.ts` - Stripe Client
| Function | Status | Description |
|----------|--------|-------------|
| `stripe` | LIVE | Stripe SDK instance |

### `/lib/file-parser.ts` - Code Output Parser
| Function | Status | Description |
|----------|--------|-------------|
| `parseGeneratedCode` | LIVE | Parses Claude output into file objects |
| `mergeGeneratedFiles` | LIVE | Merges files across iterations |
| `getFileStats` | LIVE | Returns statistics about generated files |

### `/lib/zip-generator.ts` - ZIP Archive Creator
| Function | Status | Description |
|----------|--------|-------------|
| `generateProjectZip` | LIVE | Creates ZIP with files + package.json + README |
| `extractDependencies` | LIVE | Detects npm dependencies from imports |
| `generatePackageJson` | LIVE | Creates appropriate package.json |
| `generateReadme` | LIVE | Creates project README |

### `/lib/code-tester.ts` - Code Validation
| Function | Status | Description |
|----------|--------|-------------|
| `validateSyntax` | LIVE | Checks bracket/quote balance |
| `checkImports` | LIVE | Validates imports against available files |
| `testGeneratedFiles` | LIVE | Runs all validation checks |
| `generatePreviewHTML` | LIVE | Creates static HTML preview |

### `/lib/build-context.ts` - Build Context Management
| Function | Status | Description |
|----------|--------|-------------|
| `generateTodoFromPRD` | LIVE | Creates task list from PRD analysis |
| `formatContextForPrompt` | LIVE | Builds full context string for Claude |

### `/lib/token-tracker.ts` - Token Usage Tracking
| Function | Status | Description |
|----------|--------|-------------|
| `calculateCost` | LIVE | Calculates USD cost from token counts |
| `trackTokenUsage` | LIVE | Records usage to database |
| `getBuildTokenUsage` | LIVE | Retrieves usage stats for a build |

### `/lib/build-service.ts` - Build Persistence
| Function | Status | Description |
|----------|--------|-------------|
| `createBuild` | LIVE | Creates new build record |
| `updateBuildProgress` | LIVE | Updates iteration progress |
| `saveBuildFiles` | LIVE | Stores generated files |
| `addBuildLog` | LIVE | Adds log entry |
| `completeBuild` | LIVE | Marks build done, sends receipt |
| `getUserBuilds` | LIVE | Gets all builds for user |
| `getBuildById` | LIVE | Gets single build details |
| `getBuildFiles` | LIVE | Gets files for a build |

### `/lib/supabase/client.ts` - Supabase Browser Client
| Function | Status | Description |
|----------|--------|-------------|
| `createClient` | LIVE | Creates browser Supabase client |

### `/lib/supabase/server.ts` - Supabase Server Client
| Function | Status | Description |
|----------|--------|-------------|
| `createClient` | LIVE | Creates server Supabase client with cookies |

---

## API ROUTES

### `/app/api/generate-questions/route.ts`
| Function | Status | Description |
|----------|--------|-------------|
| `POST` | LIVE | Generates questions using appstructure.md framework |

### `/app/api/generate-prd/route.ts`
| Function | Status | Description |
|----------|--------|-------------|
| `POST` | LIVE | Calls Claude to generate PRD from description + Q&A |

### `/app/api/estimate-cost/route.ts`
| Function | Status | Description |
|----------|--------|-------------|
| `POST` | LIVE | Analyzes PRD and returns cost estimate |

### `/app/api/build/route.ts`
| Function | Status | Description |
|----------|--------|-------------|
| `POST` | LIVE | Streams code generation with payment verification, PRD context, and progress updates |

### `/app/api/verify-payment/route.ts`
| Function | Status | Description |
|----------|--------|-------------|
| `POST` | LIVE | Verifies Stripe payment status |

### `/app/api/webhook/route.ts`
| Function | Status | Description |
|----------|--------|-------------|
| `POST` | LIVE | Handles Stripe webhook events |

### `/app/api/test-code/route.ts`
| Function | Status | Description |
|----------|--------|-------------|
| `POST` | LIVE | Validates generated code syntax and imports |

### `/app/api/sync-github/route.ts`
| Function | Status | Description |
|----------|--------|-------------|
| `POST` | LIVE | Pushes iteration to GitHub repo |

---

## SERVER ACTIONS

### `/app/actions/stripe.ts`
| Function | Status | Description |
|----------|--------|-------------|
| `createCheckoutSession` | LIVE | Creates Stripe embedded checkout session |
| `getCheckoutSessionStatus` | LIVE | Verifies payment status |

### `/app/actions/github.ts`
| Function | Status | Description |
|----------|--------|-------------|
| `validateGitHubToken` | LIVE | Validates PAT and returns username |
| `createGitHubRepo` | LIVE | Creates new repository |
| `pushToGitHub` | LIVE | Pushes files to repo |
| `initializeGitHubRepo` | LIVE | Creates repo for iteration syncing |
| `pushIterationToGitHub` | LIVE | Commits iteration with message |

### `/app/actions/vercel.ts`
| Function | Status | Description |
|----------|--------|-------------|
| `validateVercelToken` | LIVE | Validates token and returns username |
| `deployToVercel` | LIVE | Deploys GitHub repo to Vercel |
| `getDeploymentStatus` | LIVE | Checks deployment status |

---

## AUTH ROUTES

### `/app/auth/login/page.tsx`
| Component | Status | Description |
|-----------|--------|-------------|
| `LoginPage` | LIVE | Email/password login form |

### `/app/auth/signup/page.tsx`
| Component | Status | Description |
|-----------|--------|-------------|
| `SignupPage` | LIVE | User registration form |

### `/app/auth/signout/route.ts`
| Function | Status | Description |
|----------|--------|-------------|
| `POST/GET` | LIVE | Signs out user and redirects |

---

## UI COMPONENTS

### Step Components (`/components/steps/`)
| Component | Status | Description |
|-----------|--------|-------------|
| `DescribeStep` | LIVE | App description input with analysis storage |
| `ClarifyStep` | LIVE | Q&A wizard with category/priority display |
| `PrdStep` | LIVE | PRD review/edit |
| `EstimateStep` | LIVE | Cost breakdown display |
| `ApproveStep` | LIVE | Stripe checkout |
| `BuildStep` | LIVE | Build progress with tasks, preview, GitHub sync |
| `DownloadStep` | LIVE | ZIP download, GitHub push, Vercel deploy |

### Other Components
| Component | Status | Description |
|-----------|--------|-------------|
| `StepIndicator` | LIVE | Visual step progress |
| `GitHubModal` | LIVE | GitHub push configuration |
| `DeployModal` | LIVE | Vercel deployment flow |
| `PreviewPanel` | LIVE | Sandboxed code preview |

---

## PAGES

### `/app/page.tsx`
| Component | Status | Description |
|-----------|--------|-------------|
| `Home` | LIVE | Main wizard interface |

### `/app/dashboard/page.tsx`
| Component | Status | Description |
|-----------|--------|-------------|
| `DashboardPage` | LIVE | User's build history |

### `/app/build/[id]/page.tsx`
| Component | Status | Description |
|-----------|--------|-------------|
| `BuildDetailPage` | LIVE | Individual build details |

---

## DATABASE SCHEMA

### `profiles` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | References auth.users |
| `email` | TEXT | User email |
| `full_name` | TEXT | Display name |
| `avatar_url` | TEXT | Profile image |

### `builds` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Owner reference |
| `app_name` | TEXT | Project name |
| `app_description` | TEXT | User's description |
| `prd` | TEXT | Generated PRD |
| `status` | TEXT | pending/paid/building/completed/failed |
| `complexity` | TEXT | simple/medium/complex/enterprise |
| `estimated_cost` | DECIMAL | Predicted cost |
| `actual_cost` | DECIMAL | Real cost |
| `estimated_tokens` | INT | Predicted tokens |
| `actual_tokens_input` | INT | Real input tokens |
| `actual_tokens_output` | INT | Real output tokens |
| `stripe_session_id` | TEXT | Payment reference |
| `total_iterations` | INT | Planned iterations |
| `completed_iterations` | INT | Finished iterations |
| `files_count` | INT | Generated files |
| `lines_of_code` | INT | Total LOC |
| `github_repo_url` | TEXT | Repo link |
| `vercel_deployment_url` | TEXT | Live URL |

### `build_files` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `build_id` | UUID | Parent build |
| `file_path` | TEXT | File location |
| `content` | TEXT | File contents |
| `iteration` | INT | Which iteration |

### `build_logs` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `build_id` | UUID | Parent build |
| `iteration` | INT | Which iteration |
| `message` | TEXT | Log message |
| `type` | TEXT | info/success/warning/error |

### `token_usage` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `build_id` | UUID | Parent build |
| `iteration` | INT | Which iteration |
| `input_tokens` | INT | Input count |
| `output_tokens` | INT | Output count |
| `model` | TEXT | Model used |
| `cost_usd` | DECIMAL | Cost for this call |

---

## ENVIRONMENT VARIABLES

| Variable | Required For | Status |
|----------|-------------|--------|
| `STRIPE_SECRET_KEY` | Payment processing | Via Integration |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client Stripe | Via Integration |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification | Optional |
| `NEXT_PUBLIC_SUPABASE_URL` | Database | Via Integration |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Database | Via Integration |
| `RESEND_API_KEY` | Email receipts | User must add |
| Vercel AI Gateway | Claude API calls | Auto-configured |

User-provided at runtime:
- GitHub Personal Access Token
- Vercel Token

---

## THIRD-PARTY DEPENDENCIES

| Package | Purpose | Status |
|---------|---------|--------|
| `zustand` | State management | LIVE |
| `framer-motion` | Animations | LIVE |
| `stripe` | Server-side Stripe | LIVE |
| `@stripe/stripe-js` | Client-side Stripe | LIVE |
| `@stripe/react-stripe-js` | React Stripe components | LIVE |
| `@supabase/ssr` | Supabase auth/db | LIVE |
| `ai` | Vercel AI SDK | LIVE |
| `jszip` | ZIP file creation | LIVE |
| `octokit` | GitHub API | LIVE |
| `resend` | Email delivery | LIVE |

---

## ALL FEATURES COMPLETE

All planned features have been implemented:
- Dynamic question generation based on appstructure.md framework
- User accounts with Supabase Auth
- Build history persistence
- Token usage tracking (estimated vs actual)
- Email receipts via Resend
- GitHub integration for code storage
- Vercel deployment for one-click publish
- Code preview and validation
