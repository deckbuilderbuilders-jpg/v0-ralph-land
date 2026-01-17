import { generateText } from "ai"

// The appstructure framework as a reference for question generation
const APPSTRUCTURE_FRAMEWORK = `
## Core Requirements Framework

### 1. IDENTITY (Must Clarify)
- Purpose: What problem does this solve?
- Users: Who uses this? (B2C/B2B/internal)
- Category: landing-page | portfolio | blog | e-commerce | saas | marketplace | social | productivity | dashboard | internal-tool

### 2. AUTHENTICATION (Ask if Mentions Users/Accounts)
- Required: none | optional | required
- Methods: email-password | magic-link | oauth-google | oauth-github
- Roles: anonymous | user | premium | creator | moderator | admin

### 3. DATA (Ask if Mentions Storing/Managing Anything)
- Entities: What objects exist? (posts, products, users, etc.)
- Relationships: How do they connect?
- Access: Who can see/edit what?

### 4. FEATURES (Clarify Each Mentioned Feature)
- CRUD: Create/Read/Update/Delete operations
- Interactions: Likes, comments, shares, follows
- Search: What can be searched? Filters? Sort?
- Notifications: In-app, email, push?
- Media: Images, videos, documents?
- Real-time: Chat, live updates, collaboration?

### 5. PAGES (Infer from Features)
- Public: Home, About, Pricing, etc.
- Auth: Login, Register, Password reset
- User: Dashboard, Profile, Settings
- Admin: User management, Content moderation

### 6. PAYMENTS (Ask if Mentions Money/Premium/Subscription)
- Model: Free | One-time | Subscription | Usage-based | Marketplace
- Features: Checkout, invoices, refunds, promo codes

### 7. INTEGRATIONS (Ask if Mentions External Services)
- Auth: Social logins
- Email: Transactional emails
- Storage: File uploads
- AI: Content generation, analysis
- Analytics: Tracking, reporting

### 8. DESIGN (Optional - Use Defaults if Not Specified)
- Style: Minimal, playful, corporate, bold
- Colors: Brand colors or let us choose
- Inspiration: Any reference sites

### 9. TECHNICAL (Optional)
- Scale: Small (<10K users) | Medium | Large
- Performance: Standard | High (real-time, heavy media)
- SEO: Basic | Advanced
`

export interface QuestionCategory {
  category: string
  priority: number // 1 = must answer, 2 = should answer, 3 = nice to have
  questions: string[]
  reason: string
}

export interface GapAnalysis {
  identifiedFeatures: string[]
  missingInformation: string[]
  ambiguities: string[]
  suggestedCategory: string
  complexity: "simple" | "medium" | "complex" | "enterprise"
}

export interface GeneratedQuestions {
  analysis: GapAnalysis
  categories: QuestionCategory[]
  totalQuestions: number
}

export async function analyzeAndGenerateQuestions(appDescription: string): Promise<GeneratedQuestions> {
  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4",
    system: `You are an expert product analyst for a no-code app builder. Your job is to analyze a user's app description and generate the MINIMUM necessary clarifying questions to build a fully functional application.

FRAMEWORK FOR ANALYSIS:
${APPSTRUCTURE_FRAMEWORK}

RULES FOR QUESTION GENERATION:
1. NEVER ask generic questions - each question must be specific to what the user described
2. NEVER ask about things the user already clearly stated
3. Group questions by category with clear priorities
4. Provide a reason for each category (why these questions matter)
5. Questions should be answerable in 1-2 sentences
6. Prefer multiple choice when possible (provide options in the question)
7. Maximum 10 questions total - only ask what's truly necessary
8. For simple apps (landing pages, portfolios), you may need only 2-3 questions
9. For complex apps (SaaS, marketplaces), you may need up to 10 questions

ANALYSIS STEPS:
1. Identify what the user HAS told us
2. Identify the app category
3. Determine complexity level
4. Find gaps in must-have information
5. Find ambiguities that could lead to wrong implementation
6. Generate targeted questions to fill gaps`,
    prompt: `Analyze this app description and generate clarifying questions:

"${appDescription}"

Return a JSON object with this exact structure:
{
  "analysis": {
    "identifiedFeatures": ["list of features/requirements mentioned"],
    "missingInformation": ["list of critical missing info"],
    "ambiguities": ["list of unclear aspects"],
    "suggestedCategory": "one of: landing-page, portfolio, blog, e-commerce, saas, marketplace, social, productivity, dashboard, internal-tool",
    "complexity": "one of: simple, medium, complex, enterprise"
  },
  "categories": [
    {
      "category": "Category Name",
      "priority": 1,
      "questions": ["Question 1?", "Question 2?"],
      "reason": "Why these questions matter for the build"
    }
  ],
  "totalQuestions": 5
}

Return ONLY valid JSON, no markdown or explanation.`,
    maxTokens: 2000,
  })

  try {
    const result = JSON.parse(text)
    return result as GeneratedQuestions
  } catch (e) {
    // Fallback if JSON parsing fails
    console.error("Failed to parse questions JSON:", e)
    return {
      analysis: {
        identifiedFeatures: [],
        missingInformation: ["Could not analyze description"],
        ambiguities: [],
        suggestedCategory: "saas",
        complexity: "medium",
      },
      categories: [
        {
          category: "Core Requirements",
          priority: 1,
          questions: [
            "What is the primary purpose of this app?",
            "Who are the main users?",
            "What are the 3 most important features?",
          ],
          reason: "These are essential to understand the project scope",
        },
      ],
      totalQuestions: 3,
    }
  }
}

export function flattenQuestions(generated: GeneratedQuestions): string[] {
  return generated.categories.sort((a, b) => a.priority - b.priority).flatMap((cat) => cat.questions)
}
