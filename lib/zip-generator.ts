/**
 * ZIP Generator Utility
 * Creates downloadable ZIP files from generated code
 * Enhanced with better dependency detection and config generation
 */

import type { GeneratedFile } from "./file-parser"

// Common dependency patterns and their npm packages
const DEPENDENCY_PATTERNS: Record<string, { pkg: string; version: string; dev?: boolean }> = {
  // React ecosystem
  "framer-motion": { pkg: "framer-motion", version: "^11.0.0" },
  zustand: { pkg: "zustand", version: "^4.5.0" },
  "react-hook-form": { pkg: "react-hook-form", version: "^7.50.0" },
  "@hookform/resolvers": { pkg: "@hookform/resolvers", version: "^3.3.0" },
  zod: { pkg: "zod", version: "^3.22.0" },
  swr: { pkg: "swr", version: "^2.2.0" },
  "@tanstack/react-query": { pkg: "@tanstack/react-query", version: "^5.20.0" },

  // UI
  "lucide-react": { pkg: "lucide-react", version: "^0.330.0" },
  "@radix-ui": { pkg: "@radix-ui/react-slot", version: "^1.0.2" },
  "class-variance-authority": { pkg: "class-variance-authority", version: "^0.7.0" },
  clsx: { pkg: "clsx", version: "^2.1.0" },
  "tailwind-merge": { pkg: "tailwind-merge", version: "^2.2.0" },
  cmdk: { pkg: "cmdk", version: "^0.2.0" },
  sonner: { pkg: "sonner", version: "^1.4.0" },
  recharts: { pkg: "recharts", version: "^2.12.0" },

  // Database
  "@supabase/supabase-js": { pkg: "@supabase/supabase-js", version: "^2.40.0" },
  "@supabase/ssr": { pkg: "@supabase/ssr", version: "^0.1.0" },
  "@prisma/client": { pkg: "@prisma/client", version: "^5.10.0" },
  "drizzle-orm": { pkg: "drizzle-orm", version: "^0.29.0" },

  // Auth
  "next-auth": { pkg: "next-auth", version: "^4.24.0" },
  "@auth/core": { pkg: "@auth/core", version: "^0.28.0" },
  bcrypt: { pkg: "bcryptjs", version: "^2.4.3" },
  jsonwebtoken: { pkg: "jsonwebtoken", version: "^9.0.0" },

  // Payments
  stripe: { pkg: "stripe", version: "^14.17.0" },
  "@stripe/stripe-js": { pkg: "@stripe/stripe-js", version: "^3.0.0" },
  "@stripe/react-stripe-js": { pkg: "@stripe/react-stripe-js", version: "^2.5.0" },

  // Utilities
  "date-fns": { pkg: "date-fns", version: "^3.3.0" },
  lodash: { pkg: "lodash", version: "^4.17.21" },
  axios: { pkg: "axios", version: "^1.6.0" },
  uuid: { pkg: "uuid", version: "^9.0.0" },
  nanoid: { pkg: "nanoid", version: "^5.0.0" },

  // AI
  ai: { pkg: "ai", version: "^3.0.0" },
  "@ai-sdk/openai": { pkg: "@ai-sdk/openai", version: "^0.0.10" },
  openai: { pkg: "openai", version: "^4.28.0" },

  // File handling
  jszip: { pkg: "jszip", version: "^3.10.0" },
  sharp: { pkg: "sharp", version: "^0.33.0" },

  // Email
  resend: { pkg: "resend", version: "^3.2.0" },
  "@react-email/components": { pkg: "@react-email/components", version: "^0.0.14" },

  // Dev dependencies
  prisma: { pkg: "prisma", version: "^5.10.0", dev: true },
  "@types/bcryptjs": { pkg: "@types/bcryptjs", version: "^2.4.6", dev: true },
  "@types/jsonwebtoken": { pkg: "@types/jsonwebtoken", version: "^9.0.5", dev: true },
  "@types/lodash": { pkg: "@types/lodash", version: "^4.14.202", dev: true },
  "@types/uuid": { pkg: "@types/uuid", version: "^9.0.8", dev: true },
}

/**
 * Generate a ZIP file from parsed files using JSZip
 */
export async function generateProjectZip(files: GeneratedFile[], projectName = "ralph-app"): Promise<Blob> {
  const JSZip = (await import("jszip")).default
  const zip = new JSZip()

  const root = zip.folder(projectName)
  if (!root) throw new Error("Failed to create ZIP folder")

  // Add each file to the ZIP
  for (const file of files) {
    root.file(file.path, file.content)
  }

  // Generate smart package.json
  const hasPackageJson = files.some((f) => f.path === "package.json")
  if (!hasPackageJson) {
    root.file("package.json", generatePackageJson(projectName, files))
  }

  // Generate tailwind.config.ts if using Tailwind
  const hasTailwindConfig = files.some((f) => f.path.includes("tailwind.config"))
  const usesTailwind = files.some((f) => f.content.includes("className="))
  if (!hasTailwindConfig && usesTailwind) {
    root.file("tailwind.config.ts", generateTailwindConfig())
  }

  // Generate postcss.config.js
  const hasPostcss = files.some((f) => f.path.includes("postcss.config"))
  if (!hasPostcss && usesTailwind) {
    root.file(
      "postcss.config.js",
      `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
    )
  }

  // Generate tsconfig.json if not present
  const hasTsConfig = files.some((f) => f.path === "tsconfig.json")
  if (!hasTsConfig) {
    root.file("tsconfig.json", generateTsConfig())
  }

  // Generate next.config.js if not present
  const hasNextConfig = files.some((f) => f.path.includes("next.config"))
  if (!hasNextConfig) {
    root.file("next.config.ts", generateNextConfig(files))
  }

  // Generate .env.example for detected env vars
  const envVars = detectEnvVars(files)
  if (envVars.length > 0) {
    root.file(".env.example", envVars.map((v) => `${v}=`).join("\n"))
  }

  // Generate .gitignore
  const hasGitignore = files.some((f) => f.path === ".gitignore")
  if (!hasGitignore) {
    root.file(".gitignore", generateGitignore())
  }

  // Add README if not present
  const hasReadme = files.some((f) => f.path.toLowerCase().includes("readme"))
  if (!hasReadme) {
    root.file("README.md", generateReadme(projectName, files, envVars))
  }

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  })
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function generatePackageJson(name: string, files: GeneratedFile[]): string {
  const allContent = files.map((f) => f.content).join("\n")

  const deps: Record<string, string> = {
    next: "^14.1.0",
    react: "^18.2.0",
    "react-dom": "^18.2.0",
  }

  const devDeps: Record<string, string> = {
    typescript: "^5.3.0",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    tailwindcss: "^3.4.0",
    postcss: "^8.4.0",
    autoprefixer: "^10.4.0",
    eslint: "^8.56.0",
    "eslint-config-next": "^14.1.0",
  }

  // Detect dependencies from content
  for (const [pattern, info] of Object.entries(DEPENDENCY_PATTERNS)) {
    if (allContent.includes(pattern)) {
      if (info.dev) {
        devDeps[info.pkg] = info.version
      } else {
        deps[info.pkg] = info.version
      }
    }
  }

  // Check for specific imports
  const importRegex = /from\s+['"]([^'"./][^'"]*)['"]/g
  let match
  while ((match = importRegex.exec(allContent)) !== null) {
    const pkg = match[1].split("/")[0]
    if (pkg.startsWith("@")) {
      const scopedPkg = match[1].split("/").slice(0, 2).join("/")
      if (!deps[scopedPkg] && !devDeps[scopedPkg] && !scopedPkg.includes("components")) {
        // Check if it's a known package
        const known = Object.entries(DEPENDENCY_PATTERNS).find(([p]) => scopedPkg.includes(p))
        if (known) {
          if (known[1].dev) devDeps[known[1].pkg] = known[1].version
          else deps[known[1].pkg] = known[1].version
        }
      }
    }
  }

  return JSON.stringify(
    {
      name: name.toLowerCase().replace(/\s+/g, "-"),
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: deps,
      devDependencies: devDeps,
    },
    null,
    2,
  )
}

function generateTailwindConfig(): string {
  return `import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config`
}

function generateTsConfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: {
          "@/*": ["./*"],
        },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    },
    null,
    2,
  )
}

function generateNextConfig(files: GeneratedFile[]): string {
  const allContent = files.map((f) => f.content).join("\n")
  const usesImages = allContent.includes("<Image") || allContent.includes("next/image")

  return `import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  ${
    usesImages
      ? `images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },`
      : ""
  }
}

export default nextConfig`
}

function detectEnvVars(files: GeneratedFile[]): string[] {
  const envVars = new Set<string>()
  const allContent = files.map((f) => f.content).join("\n")

  // Match process.env.VAR_NAME patterns
  const envRegex = /process\.env\.([A-Z_][A-Z0-9_]*)/g
  let match
  while ((match = envRegex.exec(allContent)) !== null) {
    envVars.add(match[1])
  }

  // Common env vars based on detected features
  if (allContent.includes("@supabase")) {
    envVars.add("NEXT_PUBLIC_SUPABASE_URL")
    envVars.add("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    envVars.add("SUPABASE_SERVICE_ROLE_KEY")
  }

  if (allContent.includes("stripe")) {
    envVars.add("STRIPE_SECRET_KEY")
    envVars.add("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
    envVars.add("STRIPE_WEBHOOK_SECRET")
  }

  if (allContent.includes("openai") || allContent.includes("ai/")) {
    envVars.add("OPENAI_API_KEY")
  }

  return Array.from(envVars).sort()
}

function generateGitignore(): string {
  return `# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Next.js
.next/
out/

# Production
build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts`
}

function generateReadme(name: string, files: GeneratedFile[], envVars: string[]): string {
  const filesByType: Record<string, string[]> = {}
  for (const f of files) {
    const dir = f.path.split("/")[0] || "root"
    if (!filesByType[dir]) filesByType[dir] = []
    filesByType[dir].push(f.path)
  }

  return `# ${name}

Generated by Ralph Builder - AI-powered app creation.

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

${
  envVars.length > 0
    ? `2. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Then fill in your environment variables:
${envVars.map((v) => `- \`${v}\``).join("\n")}

3. Run the development server:`
    : "2. Run the development server:"
}
\`\`\`bash
npm run dev
\`\`\`

${envVars.length > 0 ? "4" : "3"}. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

${Object.entries(filesByType)
  .map(
    ([dir, paths]) => `### ${dir}/
${paths.map((p) => `- \`${p}\``).join("\n")}`,
  )
  .join("\n\n")}

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=${encodeURIComponent(`https://github.com/yourusername/${name}`)})

Or manually:
\`\`\`bash
npx vercel
\`\`\`

---

Built with [Ralph Builder](https://ralphbuilder.com)
`
}

export async function generateZip(files: GeneratedFile[], projectName = "ralph-app"): Promise<Blob> {
  return generateProjectZip(files, projectName)
}
