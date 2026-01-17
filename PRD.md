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

# NEXT.JS APP GENERATION PRD

## PROJECT STRUCTURE (REQUIRED - EXACT FORMAT)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/
│   │   └── [route]/route.ts
│   └── (routes)/
│       └── [feature]/page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   ├── features/
│   │   └── [feature-name]/index.tsx
│   └── providers.tsx
├── lib/
│   ├── utils.ts
│   ├── types.ts
│   ├── constants.ts
│   ├── api.ts
│   └── hooks/
├── config/
│   └── site.config.ts
└── styles/
    └── globals.css
```

## TECH STACK (EXACT VERSIONS)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

## CRITICAL RULES (MUST FOLLOW)

### Imports
- ✅ ALL imports use `@/` path aliases (from tsconfig.json)
- ❌ NO relative imports like `../../../`
- ✅ Use named imports: `import { Button } from '@/components/ui/button'`
- ❌ NO default imports/exports

### Component Exports
- ✅ ALL components use named exports: `export const Button: FC<ButtonProps> = (props) => {}`
- ❌ NO default exports: `export default function Button()`

### TypeScript
- ✅ Define interface for EVERY component's props
- ✅ Use union types for variants: `'primary' | 'secondary'`
- ❌ NEVER use `any` type - EVER
- ✅ Strict mode enabled in tsconfig

### Styling
- ✅ ONLY use Tailwind CSS classes: `className="px-4 py-2 rounded"`
- ❌ NO inline styles: `style={{ padding: '1rem' }}`
- ❌ NO custom CSS, NO CSS modules
- ✅ Use `cn()` utility for conditional classes: `cn('base-class', condition && 'conditional-class')`

### File Naming
- ✅ Components: PascalCase (`Button.tsx`, `UserCard.tsx`)
- ✅ Files: kebab-case (`user-card.tsx`, `auth-form.tsx`)
- ✅ Hooks: camelCase (`useUser.ts`, `useAuth.ts`)
- ❌ NO capitalized file names except components

### Component Structure
- ✅ Server components by default (no `'use client'`)
- ✅ Only add `'use client'` at the TOP of file if component needs interactivity
- ✅ Fetch data in server components, pass to client components

## REQUIRED FILES BY PHASE

### PHASE 1: Setup (7 files)

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", ".next"]
}
```

#### package.json
```json
{
  "name": "nextjs-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

#### tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
      },
    },
  },
  plugins: [],
} satisfies Config
```

#### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### src/styles/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.6%;
  --primary: 0 0% 9%;
  --border: 0 0% 89.5%;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: 0 0% 3.6%;
    --foreground: 0 0% 98.2%;
    --primary: 0 0% 98.2%;
    --border: 0 0% 14.9%;
  }
}

* {
  @apply border-border;
}

body {
  @apply bg-background text-foreground;
}
```

#### src/app/layout.tsx
```typescript
import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Next.js App',
  description: 'Generated app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

#### src/app/page.tsx
```typescript
export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Welcome</h1>
    </main>
  )
}
```

### PHASE 2: Types & Utilities (3 files)

#### src/lib/types.ts
```typescript
export interface User {
  id: string
  email: string
  name: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }
```

#### src/lib/utils.ts
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### src/lib/constants.ts
```typescript
export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
} as const

export const COLORS = {
  primary: 'hsl(0 0% 9%)',
  secondary: 'hsl(0 0% 96.1%)',
} as const
```

### PHASE 3: UI Components

#### src/components/ui/button.tsx
```typescript
import type { FC } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded transition-colors'
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:opacity-90',
    secondary: 'bg-secondary text-foreground hover:opacity-90',
    ghost: 'hover:bg-accent',
  }
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
```

#### src/components/ui/card.tsx
```typescript
import type { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const Card: FC<CardProps> = ({ className, children, ...props }) => (
  <div
    className={cn('rounded-lg border border-border bg-background p-6', className)}
    {...props}
  >
    {children}
  </div>
)

export const CardHeader: FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
)

export const CardContent: FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
)
```

#### src/components/ui/input.tsx
```typescript
import type { FC } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: FC<InputProps> = ({ className, ...props }) => (
  <input
    className={cn(
      'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2',
      'text-sm placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-primary',
      className
    )}
    {...props}
  />
)
```

### PHASE 4: Layout Components

#### src/components/layout/header.tsx
```typescript
import type { FC } from 'react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export const Header: FC<HeaderProps> = ({ className }) => (
  <header className={cn('border-b border-border bg-background px-6 py-4', className)}>
    <h1 className="text-2xl font-bold">App Name</h1>
  </header>
)
```

#### src/components/layout/sidebar.tsx
```typescript
'use client'

import type { FC } from 'react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
}

export const Sidebar: FC<SidebarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <aside
      className={cn(
        'border-r border-border bg-background',
        isOpen ? 'w-64' : 'w-16',
        'transition-all duration-300',
        className
      )}
    >
      <nav className="p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mb-4 rounded p-2 hover:bg-secondary"
        >
          {isOpen ? '←' : '→'}
        </button>
        {isOpen && (
          <ul className="space-y-2">
            <li><a href="/" className="block p-2 hover:bg-secondary rounded">Home</a></li>
          </ul>
        )}
      </nav>
    </aside>
  )
}
```

### PHASE 5: API Integration

#### src/lib/api.ts
```typescript
import type { ApiResponse } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export const api = {
  get: <T,>(path: string) => apiCall<T>(path, { method: 'GET' }),
  post: <T,>(path: string, body: unknown) =>
    apiCall<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T,>(path: string, body: unknown) =>
    apiCall<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T,>(path: string) => apiCall<T>(path, { method: 'DELETE' }),
}
```

#### src/app/api/example/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse } from '@/lib/types'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: { message: 'Hello World' },
    } as ApiResponse<{ message: string }>)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<never>,
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json(
      { success: true, data: body } as ApiResponse<unknown>,
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Bad request' } as ApiResponse<never>,
      { status: 400 }
    )
  }
}
```

## VALIDATION CHECKLIST

After each phase, verify:

- [ ] All files exist in correct paths
- [ ] `tsc --noEmit` passes (no TypeScript errors)
- [ ] No `import` statements use relative paths (all use `@/`)
- [ ] All components use named exports (no `export default`)
- [ ] No `any` types anywhere
- [ ] Only Tailwind classes for styling (no inline styles)
- [ ] All component props have TypeScript interfaces
- [ ] Files are in correct directories
- [ ] No unused imports or variables

## COMMON MISTAKES TO AVOID

### ❌ Wrong - Don't do this
```typescript
// Default exports
export default function Button() {}

// Relative imports
import Button from '../../../button'
import { cn } from './utils'

// Inline styles
<div style={{ padding: '1rem', color: 'red' }}>

// Any types
const value: any = data
const handler = (e: any) => {}

// Conflicting Tailwind
<button className="bg-red-500 bg-blue-500">

// Missing interfaces
const MyComponent = (props) => {}
```

### ✅ Correct - Do this instead
```typescript
// Named exports
export const Button: FC<ButtonProps> = (props) => {}

// @/ imports
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Tailwind classes
<div className="p-4 text-red-600">

// Proper types
import type { User } from '@/lib/types'
const value: User = data
const handler = (e: React.MouseEvent) => {}

// Conditional classes with cn()
<button className={cn('bg-red-500', isActive && 'opacity-75')}>

// Interfaces for props
interface MyComponentProps {
  title: string
  count?: number
}
const MyComponent: FC<MyComponentProps> = (props) => {}
```

## OUTPUT FORMAT

Generate files in this format:

```
=== FILE: src/path/to/file.tsx ===
[exact content]
=== END FILE ===

=== FILE: src/path/to/another.tsx ===
[exact content]
=== END FILE ===
```

Generate all files for the phase before moving to next phase.

## PHASES SUMMARY

1. **Phase 1**: Config files (tsconfig, package.json, tailwind, postcss, globals.css, layout, page)
2. **Phase 2**: Types & utilities (types.ts, utils.ts, constants.ts)
3. **Phase 3**: UI components (button, card, input, etc.)
4. **Phase 4**: Layout components (header, sidebar, footer)
5. **Phase 5**: API integration (api.ts, API routes)
6. **Phase 6**: Feature components & pages
7. **Phase 7**: Forms & validation
8. **Phase 8**: Polish & refinement

After each phase, validate using checklist above. Do not proceed to next phase until current phase is complete and validated.

# AUTO-DEPLOYMENT & PREVIEW PRD

## OVERVIEW

This system automatically deploys generated Next.js apps to Vercel and provides instant preview URLs via API.

**Flow:**
1. User requests app generation
2. App files generated locally
3. POST `/api/deploy` with app files
4. API pushes to GitHub
5. Vercel auto-deploys from GitHub
6. Return preview URL to user
7. Track deployment status via API

## DEPLOYMENT ARCHITECTURE

### Entities

```
User
  ↓
/api/deploy (POST with app files)
  ↓
GitHub Integration (Create repo + push)
  ↓
Vercel Integration (Auto-detect + deploy)
  ↓
Database (Store deployment metadata)
  ↓
/api/deployments/:id (GET status)
  ↓
Preview URL returned to user
```

### Environment Variables Required

```env
# GitHub
GITHUB_TOKEN=ghp_xxxxx
GITHUB_OWNER=your-username

# Vercel
VERCEL_TOKEN=xxxxx
VERCEL_TEAM_ID=tm_xxxxx (optional, for team accounts)
VERCEL_PROJECT_ID=prj_xxxxx (optional, for existing projects)

# Database
DATABASE_URL=postgresql://...

# App
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=production
```

## DATABASE SCHEMA

### Deployments Table

```sql
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  
  -- GitHub Info
  github_repo_url VARCHAR(255),
  github_owner VARCHAR(255),
  github_repo_name VARCHAR(255),
  github_commit_sha VARCHAR(40),
  
  -- Vercel Info
  vercel_project_id VARCHAR(255),
  vercel_deployment_id VARCHAR(255),
  vercel_preview_url VARCHAR(255),
  vercel_production_url VARCHAR(255),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  -- pending, github_pushed, vercel_deploying, vercel_deployed, failed
  
  error_message TEXT,
  
  -- Metadata
  app_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  -- File info
  file_count INTEGER,
  file_size_bytes INTEGER
);

CREATE INDEX idx_deployments_session_id ON deployments(session_id);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_deployments_created_at ON deployments(created_at);
```

### Deployment Logs Table

```sql
CREATE TABLE deployment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deployment_id UUID NOT NULL REFERENCES deployments(id),
  
  step VARCHAR(255),
  -- github_repo_creation, github_push, vercel_connect, vercel_deploy, vercel_ready
  
  status VARCHAR(50),
  -- pending, running, completed, failed
  
  message TEXT,
  duration_ms INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (deployment_id) REFERENCES deployments(id) ON DELETE CASCADE
);

CREATE INDEX idx_logs_deployment_id ON deployment_logs(deployment_id);
```

## PHASE 1: GITHUB INTEGRATION

### Required: GitHub Personal Access Token

Token must have scopes:
- `repo` (full control of private repositories)
- `user` (read user profile data)

### Implementation Files

#### src/lib/github.ts

```typescript
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export interface GitHubRepoResult {
  repoUrl: string
  repoName: string
  owner: string
  success: boolean
  error?: string
}

export interface GitHubPushResult {
  commitSha: string
  success: boolean
  error?: string
}

/**
 * Create GitHub repository
 */
export async function createGitHubRepository(
  repoName: string,
  description: string
): Promise<GitHubRepoResult> {
  try {
    const owner = process.env.GITHUB_OWNER

    if (!owner) {
      throw new Error('GITHUB_OWNER not configured')
    }

    // Check if repo already exists
    try {
      await octokit.repos.get({
        owner,
        repo: repoName,
      })
      // Repo exists, return it
      return {
        repoUrl: `https://github.com/${owner}/${repoName}`,
        repoName,
        owner,
        success: true,
      }
    } catch {
      // Repo doesn't exist, create it
    }

    const response = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description,
      private: false,
      auto_init: true,
      gitignore_template: 'Node',
    })

    return {
      repoUrl: response.data.html_url,
      repoName: response.data.name,
      owner: response.data.owner?.login || owner,
      success: true,
    }
  } catch (error) {
    return {
      repoUrl: '',
      repoName,
      owner: process.env.GITHUB_OWNER || '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create repo',
    }
  }
}

/**
 * Push files to GitHub repository
 */
export async function pushFilesToGitHub(
  owner: string,
  repoName: string,
  files: Record<string, string>,
  commitMessage: string = 'Initial commit: Generated Next.js app'
): Promise<GitHubPushResult> {
  try {
    // Get current repository tree
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo: repoName,
      ref: 'heads/main',
    })

    const currentCommitSha = refData.object.sha

    // Get the tree for current commit
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo: repoName,
      commit_sha: currentCommitSha,
    })

    // Create blobs for each file
    const blobs = await Promise.all(
      Object.entries(files).map(async ([path, content]) => {
        const { data } = await octokit.git.createBlob({
          owner,
          repo: repoName,
          content: Buffer.from(content).toString('base64'),
          encoding: 'base64',
        })
        return { path, sha: data.sha }
      })
    )

    // Create new tree
    const { data: treeData } = await octokit.git.createTree({
      owner,
      repo: repoName,
      base_tree: commitData.tree.sha,
      tree: blobs.map((blob) => ({
        path: blob.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha,
      })),
    })

    // Create new commit
    const { data: newCommitData } = await octokit.git.createCommit({
      owner,
      repo: repoName,
      message: commitMessage,
      tree: treeData.sha,
      parents: [currentCommitSha],
    })

    // Update ref
    await octokit.git.updateRef({
      owner,
      repo: repoName,
      ref: 'heads/main',
      sha: newCommitData.sha,
    })

    return {
      commitSha: newCommitData.sha,
      success: true,
    }
  } catch (error) {
    return {
      commitSha: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to push files',
    }
  }
}

/**
 * Get repository webhook info (for Vercel integration)
 */
export async function getRepositoryInfo(
  owner: string,
  repoName: string
): Promise<{ repoUrl: string; success: boolean; error?: string }> {
  try {
    const { data } = await octokit.repos.get({
      owner,
      repo: repoName,
    })

    return {
      repoUrl: data.html_url,
      success: true,
    }
  } catch (error) {
    return {
      repoUrl: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get repo info',
    }
  }
}
```

#### src/app/api/github/create-repo/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createGitHubRepository } from '@/lib/github'
import type { ApiResponse } from '@/lib/types'

interface RequestBody {
  repoName: string
  description: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()

    if (!body.repoName) {
      return NextResponse.json(
        { success: false, error: 'repoName required' } as ApiResponse<never>,
        { status: 400 }
      )
    }

    const result = await createGitHubRepository(
      body.repoName,
      body.description || 'Generated Next.js app'
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error } as ApiResponse<never>,
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        repoUrl: result.repoUrl,
        repoName: result.repoName,
        owner: result.owner,
      },
    } as ApiResponse<{ repoUrl: string; repoName: string; owner: string }>)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create repo',
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}
```

#### src/app/api/github/push-files/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { pushFilesToGitHub } from '@/lib/github'
import type { ApiResponse } from '@/lib/types'

interface RequestBody {
  owner: string
  repoName: string
  files: Record<string, string>
  commitMessage?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()

    if (!body.owner || !body.repoName || !body.files) {
      return NextResponse.json(
        { success: false, error: 'owner, repoName, files required' } as ApiResponse<never>,
        { status: 400 }
      )
    }

    const result = await pushFilesToGitHub(
      body.owner,
      body.repoName,
      body.files,
      body.commitMessage
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error } as ApiResponse<never>,
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { commitSha: result.commitSha },
    } as ApiResponse<{ commitSha: string }>)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to push files',
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}
```

## PHASE 2: VERCEL INTEGRATION

### Required: Vercel Personal Access Token

Create at: https://vercel.com/account/tokens

### Implementation Files

#### src/lib/vercel.ts

```typescript
export interface VercelProjectResult {
  projectId: string
  success: boolean
  error?: string
}

export interface VercelDeploymentResult {
  deploymentId: string
  previewUrl: string
  success: boolean
  error?: string
}

export interface VercelDeploymentStatus {
  status: 'BUILDING' | 'READY' | 'FAILED' | 'QUEUED'
  previewUrl: string
  productionUrl?: string
  success: boolean
  error?: string
}

/**
 * Create Vercel project from GitHub repo
 */
export async function createVercelProject(
  repoUrl: string,
  projectName: string
): Promise<VercelProjectResult> {
  try {
    const response = await fetch('https://api.vercel.com/v10/projects?teamId=undefined', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        gitRepository: {
          type: 'github',
          repo: repoUrl.replace('https://github.com/', ''),
        },
        framework: 'nextjs',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create project')
    }

    const data = await response.json()

    return {
      projectId: data.id,
      success: true,
    }
  } catch (error) {
    return {
      projectId: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create Vercel project',
    }
  }
}

/**
 * Trigger deployment on Vercel
 */
export async function triggerVercelDeployment(
  projectId: string,
  gitCommitSha: string
): Promise<VercelDeploymentResult> {
  try {
    const response = await fetch(
      `https://api.vercel.com/v13/deployments?projectId=${projectId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gitMetadata: {
            commitSha: gitCommitSha,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to trigger deployment')
    }

    const data = await response.json()

    return {
      deploymentId: data.id,
      previewUrl: data.url || `https://${data.name}.vercel.app`,
      success: true,
    }
  } catch (error) {
    return {
      deploymentId: '',
      previewUrl: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger deployment',
    }
  }
}

/**
 * Get deployment status
 */
export async function getVercelDeploymentStatus(
  projectId: string,
  deploymentId: string
): Promise<VercelDeploymentStatus> {
  try {
    const response = await fetch(
      `https://api.vercel.com/v13/deployments/${deploymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to get deployment status')
    }

    const data = await response.json()

    return {
      status: data.state,
      previewUrl: data.url || `https://${data.name}.vercel.app`,
      productionUrl: data.alias,
      success: true,
    }
  } catch (error) {
    return {
      status: 'FAILED',
      previewUrl: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get status',
    }
  }
}

/**
 * Wait for deployment to be ready
 */
export async function waitForDeploymentReady(
  projectId: string,
  deploymentId: string,
  maxWaitMs: number = 600000 // 10 minutes
): Promise<VercelDeploymentStatus> {
  const startTime = Date.now()
  const pollInterval = 5000 // 5 seconds

  while (Date.now() - startTime < maxWaitMs) {
    const status = await getVercelDeploymentStatus(projectId, deploymentId)

    if (status.status === 'READY') {
      return status
    }

    if (status.status === 'FAILED') {
      return status
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval))
  }

  return {
    status: 'FAILED',
    previewUrl: '',
    success: false,
    error: 'Deployment timeout',
  }
}
```

#### src/app/api/vercel/create-project/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createVercelProject } from '@/lib/vercel'
import type { ApiResponse } from '@/lib/types'

interface RequestBody {
  repoUrl: string
  projectName: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()

    if (!body.repoUrl || !body.projectName) {
      return NextResponse.json(
        { success: false, error: 'repoUrl and projectName required' } as ApiResponse<never>,
        { status: 400 }
      )
    }

    const result = await createVercelProject(body.repoUrl, body.projectName)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error } as ApiResponse<never>,
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { projectId: result.projectId },
    } as ApiResponse<{ projectId: string }>)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create project',
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}
```

#### src/app/api/vercel/trigger-deploy/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { triggerVercelDeployment } from '@/lib/vercel'
import type { ApiResponse } from '@/lib/types'

interface RequestBody {
  projectId: string
  gitCommitSha: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()

    if (!body.projectId || !body.gitCommitSha) {
      return NextResponse.json(
        { success: false, error: 'projectId and gitCommitSha required' } as ApiResponse<never>,
        { status: 400 }
      )
    }

    const result = await triggerVercelDeployment(body.projectId, body.gitCommitSha)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error } as ApiResponse<never>,
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        deploymentId: result.deploymentId,
        previewUrl: result.previewUrl,
      },
    } as ApiResponse<{ deploymentId: string; previewUrl: string }>)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to trigger deployment',
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}
```

#### src/app/api/vercel/status/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getVercelDeploymentStatus } from '@/lib/vercel'
import type { ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const deploymentId = searchParams.get('deploymentId')

    if (!projectId || !deploymentId) {
      return NextResponse.json(
        { success: false, error: 'projectId and deploymentId required' } as ApiResponse<never>,
        { status: 400 }
      )
    }

    const status = await getVercelDeploymentStatus(projectId, deploymentId)

    if (!status.success) {
      return NextResponse.json(
        { success: false, error: status.error } as ApiResponse<never>,
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        status: status.status,
        previewUrl: status.previewUrl,
        productionUrl: status.productionUrl,
      },
    } as ApiResponse<{ status: string; previewUrl: string; productionUrl?: string }>)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get status',
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}
```

## PHASE 3: DEPLOYMENT ORCHESTRATION

#### src/lib/deployment.ts

```typescript
import { db } from '@/lib/db'
import { createGitHubRepository, pushFilesToGitHub } from '@/lib/github'
import { createVercelProject, triggerVercelDeployment, waitForDeploymentReady } from '@/lib/vercel'
import type { ApiResponse } from '@/lib/types'

export interface DeploymentRequest {
  sessionId: string
  appName: string
  files: Record<string, string>
}

export interface DeploymentResponse {
  deploymentId: string
  previewUrl: string
  status: string
  eta?: number
}

/**
 * Full deployment pipeline
 */
export async function deployApp(
  request: DeploymentRequest
): Promise<ApiResponse<DeploymentResponse>> {
  const { sessionId, appName, files } = request

  try {
    // 1. Create deployment record
    const deployment = await db.deployments.create({
      sessionId,
      appName,
      status: 'pending',
      fileCount: Object.keys(files).length,
      fileSizeBytes: JSON.stringify(files).length,
    })

    // Log: Starting deployment
    await logDeploymentStep(deployment.id, 'github_repo_creation', 'running')

    // 2. Create GitHub repository
    const repoName = appName.toLowerCase().replace(/\s+/g, '-')
    const githubResult = await createGitHubRepository(repoName, `Next.js app: ${appName}`)

    if (!githubResult.success) {
      await updateDeployment(deployment.id, 'failed', githubResult.error)
      return { success: false, error: githubResult.error }
    }

    await updateDeployment(deployment.id, 'github_created', undefined, {
      githubRepoUrl: githubResult.repoUrl,
      githubRepoName: githubResult.repoName,
      githubOwner: githubResult.owner,
    })

    // Log: GitHub repo created
    await logDeploymentStep(deployment.id, 'github_repo_creation', 'completed')

    // Log: Starting GitHub push
    await logDeploymentStep(deployment.id, 'github_push', 'running')

    // 3. Push files to GitHub
    const pushResult = await pushFilesToGitHub(
      githubResult.owner,
      githubResult.repoName,
      files,
      `Initial commit: ${appName}`
    )

    if (!pushResult.success) {
      await updateDeployment(deployment.id, 'failed', pushResult.error)
      return { success: false, error: pushResult.error }
    }

    await updateDeployment(deployment.id, 'github_pushed', undefined, {
      gitCommitSha: pushResult.commitSha,
    })

    // Log: GitHub push completed
    await logDeploymentStep(deployment.id, 'github_push', 'completed')

    // Log: Connecting to Vercel
    await logDeploymentStep(deployment.id, 'vercel_connect', 'running')

    // 4. Create Vercel project
    const vercelResult = await createVercelProject(
      githubResult.repoUrl,
      repoName
    )

    if (!vercelResult.success) {
      await updateDeployment(deployment.id, 'failed', vercelResult.error)
      return { success: false, error: vercelResult.error }
    }

    await updateDeployment(deployment.id, 'vercel_connected', undefined, {
      vercelProjectId: vercelResult.projectId,
    })

    // Log: Vercel connected
    await logDeploymentStep(deployment.id, 'vercel_connect', 'completed')

    // Log: Starting Vercel deployment
    await logDeploymentStep(deployment.id, 'vercel_deploy', 'running')

    // 5. Trigger Vercel deployment
    const deployResult = await triggerVercelDeployment(
      vercelResult.projectId,
      pushResult.commitSha
    )

    if (!deployResult.success) {
      await updateDeployment(deployment.id, 'failed', deployResult.error)
      return { success: false, error: deployResult.error }
    }

    await updateDeployment(deployment.id, 'vercel_deploying', undefined, {
      vercelDeploymentId: deployResult.deploymentId,
      vercelPreviewUrl: deployResult.previewUrl,
    })

    // Log: Deployment started
    await logDeploymentStep(deployment.id, 'vercel_deploy', 'completed')

    // Log: Waiting for ready
    await logDeploymentStep(deployment.id, 'vercel_ready', 'running')

    // 6. Wait for deployment to be ready (non-blocking, but return status)
    waitForDeploymentReady(vercelResult.projectId, deployResult.deploymentId)
      .then(async (status) => {
        if (status.status === 'READY') {
          await updateDeployment(deployment.id, 'deployed', undefined, {
            vercelPreviewUrl: status.previewUrl,
            vercelProductionUrl: status.productionUrl,
          })
          await logDeploymentStep(deployment.id, 'vercel_ready', 'completed')
        } else {
          await updateDeployment(deployment.id, 'failed', status.error)
          await logDeploymentStep(deployment.id, 'vercel_ready', 'failed')
        }
      })
      .catch((error) => {
        updateDeployment(deployment.id, 'failed', error.message)
      })

    return {
      success: true,
      data: {
        deploymentId: deployment.id,
        previewUrl: deployResult.previewUrl,
        status: 'deploying',
        eta: 120, // 2 minutes estimated
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deployment failed',
    }
  }
}

/**
 * Get deployment status
 */
export async function getDeploymentStatus(deploymentId: string): Promise<ApiResponse<DeploymentResponse>> {
  try {
    const deployment = await db.deployments.findUnique({
      where: { id: deploymentId },
    })

    if (!deployment) {
      return { success: false, error: 'Deployment not found' }
    }

    return {
      success: true,
      data: {
        deploymentId: deployment.id,
        previewUrl: deployment.vercelPreviewUrl || '',
        status: deployment.status,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get status',
    }
  }
}

/**
 * Helper: Update deployment
 */
async function updateDeployment(
  deploymentId: string,
  status: string,
  error?: string,
  updates?: Record<string, any>
) {
  const data: Record<string, any> = {
    status,
    updatedAt: new Date(),
  }

  if (error) {
    data.errorMessage = error
  }

  if (updates) {
    Object.assign(data, updates)
  }

  if (status === 'deployed') {
    data.completedAt = new Date()
  }

  return db.deployments.update({
    where: { id: deploymentId },
    data,
  })
}

/**
 * Helper: Log deployment step
 */
async function logDeploymentStep(
  deploymentId: string,
  step: string,
  status: string,
  message?: string
) {
  return db.deploymentLogs.create({
    deploymentId,
    step,
    status,
    message,
  })
}
```

#### src/app/api/deploy/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { deployApp } from '@/lib/deployment'
import type { ApiResponse } from '@/lib/types'

interface DeployRequest {
  sessionId: string
  appName: string
  files: Record<string, string>
}

export async function POST(request: NextRequest) {
  try {
    const body: DeployRequest = await request.json()

    if (!body.sessionId || !body.appName || !body.files) {
      return NextResponse.json(
        { success: false, error: 'sessionId, appName, files required' } as ApiResponse<never>,
        { status: 400 }
      )
    }

    const result = await deployApp(body)

    if (!result.success) {
      return NextResponse.json(result as ApiResponse<never>, { status: 400 })
    }

    return NextResponse.json(result, { status: 202 }) // 202 Accepted
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed',
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}
```

#### src/app/api/deployments/[id]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getDeploymentStatus } from '@/lib/deployment'
import type { ApiResponse } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { success: false, error: 'Deployment ID required' } as ApiResponse<never>,
        { status: 400 }
      )
    }

    const result = await getDeploymentStatus(params.id)

    if (!result.success) {
      return NextResponse.json(result as ApiResponse<never>, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get status',
      } as ApiResponse<never>,
      { status: 500 }
    )
  }
}
```

## PHASE 4: CLIENT-SIDE DEPLOYMENT HOOK

#### src/lib/hooks/useDeployment.ts

```typescript
'use client'

import { useState, useEffect } from 'react'
import type { ApiResponse } from '@/lib/types'

interface DeploymentState {
  deploymentId: string | null
  previewUrl: string | null
  status: 'idle' | 'deploying' | 'deployed' | 'failed'
  error: string | null
  progress: number
}

export function useDeployment() {
  const [state, setState] = useState<DeploymentState>({
    deploymentId: null,
    previewUrl: null,
    status: 'idle',
    error: null,
    progress: 0,
  })

  /**
   * Start deployment
   */
  const deploy = async (
    appName: string,
    files: Record<string, string>,
    sessionId: string
  ) => {
    setState((prev) => ({ ...prev, status: 'deploying', error: null }))

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, appName, files }),
      })

      const data = (await response.json()) as ApiResponse<{
        deploymentId: string
        previewUrl: string
      }>

      if (!data.success) {
        setState((prev) => ({
          ...prev,
          status: 'failed',
          error: data.error || 'Deployment failed',
        }))
        return
      }

      setState((prev) => ({
        ...prev,
        deploymentId: data.data.deploymentId,
        previewUrl: data.data.previewUrl,
        progress: 30,
      }))

      // Poll for status
      pollDeploymentStatus(data.data.deploymentId)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Deployment failed',
      }))
    }
  }

  /**
   * Poll deployment status
   */
  const pollDeploymentStatus = async (deploymentId: string) => {
    const maxAttempts = 120 // 10 minutes at 5-second intervals
    let attempts = 0

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setState((prev) => ({
          ...prev,
          status: 'failed',
          error: 'Deployment timeout',
        }))
        return
      }

      try {
        const response = await fetch(`/api/deployments/${deploymentId}`)
        const data = (await response.json()) as ApiResponse<{
          status: string
          previewUrl: string
        }>

        if (!data.success) {
          setState((prev) => ({
            ...prev,
            status: 'failed',
            error: data.error || 'Failed to get status',
          }))
          return
        }

        const statusMap: Record<string, DeploymentState['status']> = {
          pending: 'deploying',
          github_created: 'deploying',
          github_pushed: 'deploying',
          vercel_connected: 'deploying',
          vercel_deploying: 'deploying',
          deployed: 'deployed',
          failed: 'failed',
        }

        const mappedStatus = statusMap[data.data.status] || 'deploying'
        const progressMap: Record<string, number> = {
          pending: 10,
          github_created: 20,
          github_pushed: 40,
          vercel_connected: 50,
          vercel_deploying: 70,
          deployed: 100,
          failed: 0,
        }

        setState((prev) => ({
          ...prev,
          status: mappedStatus,
          previewUrl: data.data.previewUrl,
          progress: progressMap[data.data.status] || 30,
        }))

        if (mappedStatus !== 'deploying') {
          return
        }

        attempts++
        setTimeout(poll, 5000) // Poll every 5 seconds
      } catch (error) {
        setState((prev) => ({
          ...prev,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Status check failed',
        }))
      }
    }

    poll()
  }

  return { ...state, deploy }
}
```

## VALIDATION CHECKLIST

### Phase 1: GitHub Integration
- [ ] GITHUB_TOKEN set in .env
- [ ] GITHUB_OWNER set in .env
- [ ] createGitHubRepository works
- [ ] pushFilesToGitHub works
- [ ] Repo created at GitHub
- [ ] Files pushed successfully
- [ ] API endpoints respond correctly

### Phase 2: Vercel Integration
- [ ] VERCEL_TOKEN set in .env
- [ ] createVercelProject works
- [ ] triggerVercelDeployment works
- [ ] getVercelDeploymentStatus works
- [ ] Project created in Vercel
- [ ] Deployment triggered
- [ ] Status tracking works

### Phase 3: Orchestration
- [ ] Database tables created
- [ ] deployApp function works end-to-end
- [ ] /api/deploy responds correctly
- [ ] /api/deployments/:id responds correctly
- [ ] All steps logged properly
- [ ] Error handling works
- [ ] Status updates work

### Phase 4: Client Hook
- [ ] useDeployment hook works
- [ ] deploy() function starts deployment
- [ ] pollDeploymentStatus() polls correctly
- [ ] Status updates reflected in UI
- [ ] Preview URL returns when ready
- [ ] Error handling works
- [ ] Timeout handling works

## ENVIRONMENT SETUP INSTRUCTIONS

### 1. GitHub Setup
```bash
# 1. Create GitHub Personal Access Token
# Go to: https://github.com/settings/tokens
# Scopes needed: repo, user
# Copy token

# 2. Set environment variables
GITHUB_TOKEN=ghp_xxxxx
GITHUB_OWNER=your-github-username
```

### 2. Vercel Setup
```bash
# 1. Create Vercel Personal Access Token
# Go to: https://vercel.com/account/tokens
# Copy token

# 2. Get team ID (if using team account)
# Go to: https://vercel.com/account/team
# Copy team ID

# 3. Set environment variables
VERCEL_TOKEN=xxxxx
VERCEL_TEAM_ID=tm_xxxxx # optional
```

### 3. Database Setup
```bash
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Create tables
psql -f scripts/init-db.sql
```

## DEPLOYMENT FLOW

```
User Request
  ↓
POST /api/deploy { appName, files, sessionId }
  ↓
Create deployment record
  ↓
Create GitHub repository
  ↓
Push files to GitHub
  ↓
Create Vercel project
  ↓
Trigger Vercel deployment
  ↓
Return deployment ID + preview URL (status: deploying)
  ↓
Client polls /api/deployments/:id every 5 seconds
  ↓
Vercel builds and deploys (2-5 min)
  ↓
Status becomes 'deployed'
  ↓
Preview URL accessible
```

## API ENDPOINTS

### POST /api/deploy
**Request:**
```json
{
  "sessionId": "unique-session-id",
  "appName": "My Awesome App",
  "files": {
    "src/app/page.tsx": "export default function Home() {...}",
    "package.json": "{...}",
    ...
  }
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "deploymentId": "uuid",
    "previewUrl": "https://my-awesome-app.vercel.app",
    "status": "deploying",
    "eta": 120
  }
}
```

### GET /api/deployments/:id
**Response:**
```json
{
  "success": true,
  "data": {
    "deploymentId": "uuid",
    "previewUrl": "https://my-awesome-app.vercel.app",
    "status": "deployed"
  }
}
```

## STATUS VALUES

- `pending` - Deployment created, starting
- `github_created` - GitHub repo created
- `github_pushed` - Files pushed to GitHub
- `vercel_connected` - Vercel project created
- `vercel_deploying` - Vercel building
- `deployed` - Ready at preview URL
- `failed` - Something went wrong

## PRODUCTION CHECKLIST

- [ ] All tokens set as secrets (not in git)
- [ ] Database migrations run
- [ ] Error logging configured
- [ ] Rate limiting on /api/deploy
- [ ] CORS configured for preview domains
- [ ] Webhook verification (optional: Vercel webhooks)
- [ ] Monitoring & alerts set up
- [ ] Backup strategy for deployments table
- [ ] Session cleanup job (delete old deployments)


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
