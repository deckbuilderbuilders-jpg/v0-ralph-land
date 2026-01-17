# App Structure Framework

This document defines the comprehensive requirements framework that Ralph Builder uses to ensure every generated application is fully functional. When a user provides an app description, we compare it against this framework to identify gaps and generate targeted clarifying questions.

---

## 1. CORE IDENTITY

### 1.1 Purpose & Value Proposition
- **Primary Problem**: What specific problem does this app solve?
- **Target Users**: Who are the primary users? (B2C consumers, B2B professionals, internal team, developers)
- **Value Delivered**: What value does the user get from using this app?
- **Success Metrics**: How will users measure success with this app?

### 1.2 App Category
Categories determine baseline feature sets:
- `landing-page` - Marketing/info site (no auth, no database)
- `portfolio` - Showcase work (optional CMS)
- `blog` - Content publishing (CMS, possibly auth for admin)
- `e-commerce` - Sell products (auth, database, payments, cart)
- `saas` - Software service (auth, database, subscriptions, dashboard)
- `marketplace` - Connect buyers/sellers (multi-user auth, transactions)
- `social` - User-generated content (auth, database, real-time)
- `productivity` - Tools/utilities (auth, database, possibly offline)
- `dashboard` - Data visualization (auth, data source integration)
- `internal-tool` - Business operations (auth, RBAC, integrations)

---

## 2. USER SYSTEM

### 2.1 Authentication Requirements
| Question | Options |
|----------|---------|
| Auth Required? | `none` / `optional` / `required` |
| Auth Methods | `email-password` / `magic-link` / `oauth-google` / `oauth-github` / `oauth-custom` |
| User Verification | `none` / `email-confirmation` / `phone-sms` / `admin-approval` |
| Password Policy | `basic` (8 chars) / `strong` (12+ mixed) / `custom` |
| Session Duration | `session` / `24h` / `7d` / `30d` / `persistent` |

### 2.2 User Roles & Permissions
| Role Type | Description |
|-----------|-------------|
| `anonymous` | Can view public content only |
| `user` | Standard registered user |
| `premium` | Paid/upgraded user with extra features |
| `creator` | Can create/publish content |
| `moderator` | Can manage user content |
| `admin` | Full system access |
| `super-admin` | Can manage other admins |

### 2.3 User Profile Data
Standard fields to consider:
- Display name, avatar, bio
- Contact info (email, phone)
- Preferences (theme, language, notifications)
- Social links
- Custom fields per app type

---

## 3. DATA ARCHITECTURE

### 3.1 Database Requirements
| Question | Options |
|----------|---------|
| Data Persistence | `none` / `local-storage` / `database` |
| Database Type | `relational` (PostgreSQL) / `document` (MongoDB-style) |
| Data Volume | `small` (<10K records) / `medium` (10K-1M) / `large` (1M+) |
| Query Complexity | `simple` CRUD / `complex` joins/aggregations / `search` full-text |

### 3.2 Core Data Entities
Every app needs to define its primary entities:
```
Entity Template:
- Name (singular/plural)
- Fields (name, type, required, unique, indexed)
- Relationships (belongs-to, has-many, many-to-many)
- Access rules (who can create/read/update/delete)
- Soft delete? Versioning? Audit log?
```

### 3.3 Data Relationships
| Type | Example |
|------|---------|
| One-to-One | User → Profile |
| One-to-Many | User → Posts |
| Many-to-Many | Posts ↔ Tags |
| Self-referential | Comments → Replies |
| Polymorphic | Likes → (Post OR Comment) |

### 3.4 Data Validation Rules
- Required fields
- Format validation (email, URL, phone)
- Length constraints (min/max)
- Enum constraints (status values)
- Custom validation (business rules)

---

## 4. FEATURES & FUNCTIONALITY

### 4.1 Content Management
| Feature | Details to Capture |
|---------|-------------------|
| Create | Form fields, validation, drafts? |
| Read | List view, detail view, pagination |
| Update | Edit permissions, version history? |
| Delete | Soft/hard delete, confirmation, cascade |
| Search | Fields to search, filters, sorting |

### 4.2 User Interactions
| Interaction | Implementation Needs |
|-------------|---------------------|
| Likes/Reactions | Count display, toggle state, who liked |
| Comments | Threading? Editing? Moderation? |
| Sharing | Social platforms, copy link, embed |
| Following | Users, topics, notifications |
| Bookmarks/Saves | Collections? Tags? |
| Ratings/Reviews | Scale (1-5, 1-10), text review? |

### 4.3 Notifications
| Type | Details |
|------|---------|
| In-app | Toast, badge, notification center |
| Email | Transactional, digest, marketing |
| Push | Browser, mobile |
| SMS | Verification, alerts |

### 4.4 Media Handling
| Media Type | Requirements |
|------------|--------------|
| Images | Upload, resize, crop, CDN, formats |
| Videos | Upload, streaming, thumbnails |
| Documents | PDF, Office, preview |
| Audio | Upload, player, waveform |

### 4.5 Real-time Features
| Feature | Technology |
|---------|------------|
| Live updates | WebSocket, SSE |
| Chat/messaging | Socket.io, Pusher |
| Presence | Online status |
| Collaborative editing | CRDT, OT |

---

## 5. PAGES & NAVIGATION

### 5.1 Standard Pages
Every app should consider:
- **Public**: Home, About, Contact, Pricing, FAQ, Blog, Terms, Privacy
- **Auth**: Login, Register, Forgot Password, Reset Password, Verify Email
- **User**: Dashboard, Profile, Settings, Notifications
- **Admin**: User Management, Content Management, Analytics, Settings

### 5.2 Navigation Patterns
| Pattern | Use Case |
|---------|----------|
| Top navbar | Standard websites |
| Sidebar | Dashboards, admin panels |
| Bottom tabs | Mobile-first apps |
| Breadcrumbs | Deep hierarchies |
| Command palette | Power users |

### 5.3 URL Structure
- Clean URLs (`/blog/my-post` vs `/blog?id=123`)
- Dynamic routes (`/users/[id]`)
- Catch-all routes (`/docs/[...slug]`)
- Internationalization (`/en/about`)

---

## 6. BUSINESS LOGIC

### 6.1 Payments & Monetization
| Model | Requirements |
|-------|--------------|
| One-time purchase | Checkout flow, receipt |
| Subscription | Plans, billing cycle, upgrade/downgrade |
| Usage-based | Metering, invoicing |
| Freemium | Feature gating, upgrade prompts |
| Marketplace | Splits, payouts, escrow |

### 6.2 Payment Features
- Payment methods (card, bank, wallets)
- Currencies supported
- Tax handling
- Refund policy
- Invoice generation
- Promo codes/discounts

### 6.3 Workflows & Automation
| Trigger | Actions |
|---------|---------|
| User signup | Welcome email, create profile |
| Purchase | Receipt, access grant, notification |
| Content publish | Notifications, social share |
| Scheduled | Daily digest, cleanup tasks |

---

## 7. INTEGRATIONS

### 7.1 Common Integrations
| Category | Services |
|----------|----------|
| Auth | Google, GitHub, Twitter, Facebook, Apple |
| Payments | Stripe, PayPal, Square |
| Email | SendGrid, Resend, Postmark |
| Storage | AWS S3, Cloudflare R2, Vercel Blob |
| Analytics | Google Analytics, Mixpanel, PostHog |
| Search | Algolia, Elasticsearch, Meilisearch |
| CMS | Sanity, Contentful, Strapi |
| AI | OpenAI, Anthropic, Replicate |

### 7.2 API Design
- REST vs GraphQL
- Rate limiting
- API keys / OAuth
- Webhooks (incoming/outgoing)
- SDK/client library needs

---

## 8. UI/UX REQUIREMENTS

### 8.1 Design System
| Element | Specifications |
|---------|----------------|
| Colors | Primary, secondary, accent, semantic (success/error/warning) |
| Typography | Headings, body, code, scale |
| Spacing | Base unit, scale |
| Borders | Radius, widths |
| Shadows | Elevation levels |

### 8.2 Component Library
| Category | Components |
|----------|------------|
| Layout | Container, Grid, Stack, Divider |
| Navigation | Navbar, Sidebar, Tabs, Breadcrumbs |
| Forms | Input, Select, Checkbox, Radio, DatePicker, FileUpload |
| Feedback | Alert, Toast, Progress, Spinner, Skeleton |
| Data Display | Table, Card, List, Avatar, Badge |
| Overlay | Modal, Drawer, Tooltip, Popover |

### 8.3 Responsive Design
| Breakpoint | Target |
|------------|--------|
| sm (640px) | Large phones |
| md (768px) | Tablets |
| lg (1024px) | Laptops |
| xl (1280px) | Desktops |
| 2xl (1536px) | Large screens |

### 8.4 Accessibility
- Keyboard navigation
- Screen reader support
- Color contrast (WCAG AA/AAA)
- Focus indicators
- Alt text for images
- ARIA labels

### 8.5 Animations & Transitions
| Type | Use Case |
|------|----------|
| Page transitions | Route changes |
| Micro-interactions | Button hover, form feedback |
| Loading states | Skeletons, spinners |
| Reveals | Scroll animations, stagger |

---

## 9. TECHNICAL REQUIREMENTS

### 9.1 Performance Targets
| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| TTI | < 3.5s |

### 9.2 SEO Requirements
- Meta tags (title, description, keywords)
- Open Graph / Twitter cards
- Sitemap.xml
- Robots.txt
- Structured data (JSON-LD)
- Canonical URLs

### 9.3 Security
| Concern | Implementation |
|---------|---------------|
| XSS | Input sanitization, CSP |
| CSRF | Tokens, SameSite cookies |
| SQL Injection | Parameterized queries |
| Rate Limiting | Per IP/user limits |
| Data Encryption | HTTPS, at-rest encryption |

### 9.4 Deployment & Infrastructure
- Hosting (Vercel, AWS, etc.)
- CDN configuration
- Environment variables
- CI/CD pipeline
- Monitoring & logging
- Backup strategy

---

## 10. TESTING REQUIREMENTS

### 10.1 Test Types
| Type | Coverage |
|------|----------|
| Unit | Utility functions, hooks |
| Integration | API routes, database queries |
| E2E | Critical user flows |
| Visual | Component screenshots |
| Accessibility | Automated a11y checks |

### 10.2 Test Scenarios
For each feature, define:
- Happy path (normal usage)
- Edge cases (empty state, max values)
- Error handling (invalid input, network failure)
- Permission checks (unauthorized access)

---

## 11. GAP ANALYSIS RULES

When analyzing user input, check for:

### Must-Have Information (Block if Missing)
1. **Core purpose** - What does the app do?
2. **Target users** - Who uses it?
3. **Primary features** - What are the main things users can do?

### Should-Have Information (Ask if Unclear)
1. **Auth requirements** - Do users need accounts?
2. **Data model** - What data is stored/managed?
3. **Key user flows** - What are the main journeys?

### Nice-to-Have Information (Use Defaults if Missing)
1. **Design preferences** - Default to modern/minimal
2. **Tech preferences** - Default to Next.js/Tailwind/shadcn
3. **Performance needs** - Default to standard optimization

### Question Priority Algorithm
```
Priority 1: Questions about missing must-have info
Priority 2: Questions to disambiguate unclear should-have info  
Priority 3: Questions about complex features mentioned
Priority 4: Questions about edge cases and error handling
```

---

## 12. QUESTION TEMPLATES

### Category: Purpose & Users
- "Who is the primary user of this app - consumers, businesses, or internal teams?"
- "What's the one thing users should accomplish with this app?"
- "How will users discover and access this app?"

### Category: Authentication
- "Do users need to create accounts, or can they use the app anonymously?"
- "Should users be able to sign up with Google/GitHub, or just email/password?"
- "Are there different user roles with different permissions?"

### Category: Data
- "What are the main things users will create, view, or manage in this app?"
- "Do users need to see each other's content, or is everything private?"
- "How much data do you expect - dozens, thousands, or millions of records?"

### Category: Features
- "Do users need to search or filter content? What fields matter most?"
- "Should users be able to comment, like, or share content?"
- "Do you need any real-time features like chat or live updates?"

### Category: Payments
- "Is this a free app, paid product, or subscription service?"
- "Do you need to process payments or just display pricing?"
- "Should there be a free tier or trial period?"

### Category: Design
- "Do you have brand colors or a design direction in mind?"
- "Should this feel more playful or professional?"
- "Do you have any example sites/apps that have the look you want?"

### Category: Technical
- "Do you need to integrate with any existing services or APIs?"
- "Are there any specific performance requirements?"
- "Do you have preferences for hosting or infrastructure?"
