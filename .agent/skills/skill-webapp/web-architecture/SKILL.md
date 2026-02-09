---
name: web-architecture
version: 1.0.0
description: When the user wants to design, plan, or choose the architecture for a web application. Also use when the user mentions "tech stack," "framework choice," "project setup," "Next.js vs Vite," "SPA vs SSR," "folder structure," or "project architecture." For database schema design, see database-design. For authentication setup, see auth-implementation.
---

# Web Architecture

You are an expert web architect. Your goal is to help design scalable, maintainable, and performant web application architectures that match the project's requirements and constraints.

## Initial Assessment

**Check for existing project context first:**
Review `package.json`, existing code structure, and any documentation before making recommendations.

Before designing architecture, understand:

1. **Project Type**
   - Landing page / Marketing site?
   - Web Application (SaaS, Dashboard)?
   - E-commerce?
   - Content site / Blog?

2. **Scale & Complexity**
   - Expected user count?
   - How many pages/routes?
   - Real-time features needed?
   - Multi-tenant?

3. **Team & Constraints**
   - Team size and expertise?
   - Timeline?
   - Budget for hosting/services?
   - Existing tech preferences?

4. **Requirements**
   - SEO critical?
   - Offline support needed?
   - Authentication required?
   - Payment processing?

---

## Core Principles

### 1. Right Tool for the Job
Don't use a sledgehammer for a nail. Match complexity to requirements.
- Simple landing page → Plain HTML/CSS or Astro
- Dynamic app → Next.js or Vite + React
- Content-heavy → Astro or Next.js with MDX

### 2. Start Simple, Scale When Needed
Avoid premature optimization. Build for today, design for tomorrow.
- Begin with proven patterns
- Add complexity only when justified
- Measure before optimizing

### 3. Developer Experience Matters
Happy developers build better products.
- Fast builds and hot reload
- Clear folder structure
- Type safety with TypeScript
- Good error messages

### 4. Performance by Default
Build fast from the start.
- Code splitting
- Image optimization
- Minimal JavaScript
- CDN delivery

---

## Framework Decision Matrix

### Quick Reference

| Need | Best Choice | Why |
|------|-------------|-----|
| Marketing/Landing | **Astro** | Zero JS by default, fast |
| Full SaaS App | **Next.js** | Full-featured, scalable |
| SPA Dashboard | **Vite + React** | Fast dev, flexible |
| E-commerce | **Next.js** | SEO + dynamic |
| Blog/Content | **Astro** | Content-focused |
| Prototypes | **Vite + React** | Quick setup |

### Rendering Strategies

| Strategy | Best For | Trade-offs |
|----------|----------|------------|
| **SSG** (Static Site Generation) | Blogs, marketing, docs | Build time scales with pages |
| **SSR** (Server-Side Rendering) | Dynamic content, SEO | Server load, complexity |
| **SPA** (Single Page App) | Dashboards, apps | No SEO, larger JS bundle |
| **ISR** (Incremental Static) | Large e-commerce | Next.js specific |
| **Hybrid** | Complex sites | More configuration |

---

## Tech Stack Recommendations

### 🏆 Recommended Stack (2024+)

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND                                 │
├─────────────────────────────────────────────────────────────┤
│  Framework: Next.js 14+ (App Router) or Vite + React        │
│  Language:  TypeScript (strict mode)                        │
│  Styling:   Tailwind CSS + CSS Modules for complex          │
│  State:     Zustand (simple) or TanStack Query (server)     │
│  Forms:     React Hook Form + Zod validation                │
│  UI:        Radix UI primitives + custom components         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND                                  │
├─────────────────────────────────────────────────────────────┤
│  BaaS:      Supabase (PostgreSQL + Auth + Storage + RT)     │
│  API:       Next.js API Routes or Supabase Edge Functions   │
│  Auth:      Supabase Auth (email, OAuth, magic links)       │
│  Storage:   Supabase Storage or Cloudflare R2               │
│  Email:     Resend or SendGrid                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE                              │
├─────────────────────────────────────────────────────────────┤
│  Hosting:   Vercel (Next.js) or Cloudflare Pages (Vite)     │
│  CDN:       Included with Vercel/Cloudflare                 │
│  Domain:    Cloudflare (DNS + protection)                   │
│  Monitoring: Sentry (errors) + Vercel Analytics             │
└─────────────────────────────────────────────────────────────┘
```

### Alternative Stacks

**Lean Stack** (Startups, MVPs)
```
Astro + Supabase + Cloudflare Pages
→ Minimal cost, fast development
```

**Enterprise Stack** (Large teams, compliance)
```
Next.js + PostgreSQL + AWS/GCP + Auth0
→ Full control, compliance support
```

**Content Stack** (Blogs, docs, marketing)
```
Astro + MDX + Cloudflare Pages
→ Blazing fast, content-focused
```

---

## Folder Structure

### Next.js App Router (Recommended)

```
project/
├── app/                        # App Router pages
│   ├── (auth)/                 # Auth route group
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/            # Dashboard route group
│   │   ├── layout.tsx          # Shared dashboard layout
│   │   ├── page.tsx            # Dashboard home
│   │   └── settings/page.tsx
│   ├── (marketing)/            # Public pages
│   │   ├── page.tsx            # Homepage
│   │   ├── pricing/page.tsx
│   │   └── about/page.tsx
│   ├── api/                    # API routes
│   │   └── webhooks/
│   │       └── stripe/route.ts
│   ├── layout.tsx              # Root layout
│   └── globals.css
├── components/
│   ├── ui/                     # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── modal.tsx
│   ├── forms/                  # Form components
│   │   └── login-form.tsx
│   └── layout/                 # Layout components
│       ├── header.tsx
│       ├── footer.tsx
│       └── sidebar.tsx
├── lib/                        # Utilities & configs
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Auth middleware
│   ├── utils.ts                # Helper functions
│   └── constants.ts            # App constants
├── hooks/                      # Custom React hooks
│   ├── use-user.ts
│   └── use-toast.ts
├── types/                      # TypeScript types
│   ├── database.ts             # Supabase generated
│   └── index.ts                # App types
├── public/                     # Static assets
│   ├── images/
│   └── favicon.ico
├── .env.local                  # Environment variables
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Vite + React Structure

```
project/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   └── layout/
│   ├── pages/                  # Route components
│   │   ├── Home.tsx
│   │   └── Dashboard.tsx
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
└── package.json
```

---

## Project Setup Guides

### Next.js 14 Setup

```bash
# Create project
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Navigate to project
cd my-app

# Install essential dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install zod react-hook-form @hookform/resolvers
npm install zustand
npm install lucide-react
npm install clsx tailwind-merge

# Dev dependencies
npm install -D @types/node
```

### Vite + React Setup

```bash
# Create project
npm create vite@latest my-app -- --template react-ts

# Navigate to project
cd my-app

# Install dependencies
npm install
npm install @supabase/supabase-js
npm install react-router-dom
npm install zod react-hook-form @hookform/resolvers
npm install zustand
npm install lucide-react

# Tailwind setup
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Essential Configuration

**TypeScript (tsconfig.json)**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**ESLint Rules**
```json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

## Component Architecture

### Component Types

| Type | Purpose | Example |
|------|---------|---------|
| **UI** | Reusable primitives | Button, Input, Modal |
| **Layout** | Page structure | Header, Sidebar, Footer |
| **Feature** | Business logic | LoginForm, ProductCard |
| **Page** | Route entry | Dashboard, Settings |

### Component Pattern

```typescript
// components/ui/button.tsx
import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors',
        // Variant styles
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        variant === 'ghost' && 'hover:bg-gray-100',
        // Size styles
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Utility Function

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## State Management

### Decision Guide

| Scenario | Solution |
|----------|----------|
| Server data (API calls) | TanStack Query |
| Global UI state | Zustand |
| Form state | React Hook Form |
| URL state | Next.js/React Router |
| Component state | useState/useReducer |

### Zustand Store Pattern

```typescript
// stores/user-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);
```

---

## Environment Variables

### Structure

```env
# .env.local (never commit)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Server only!

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MyApp

# External Services
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

### Validation Pattern

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
```

---

## Common Patterns

### API Route Pattern (Next.js)

```typescript
// app/api/users/[id]/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
```

### Protected Route Pattern

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

---

## Checklist

### Pre-Development
- [ ] Requirements documented
- [ ] Framework chosen with rationale
- [ ] Folder structure defined
- [ ] Tech stack documented
- [ ] Environment variables planned

### Project Setup
- [ ] Project initialized with TypeScript
- [ ] ESLint + Prettier configured
- [ ] Tailwind CSS setup
- [ ] Git repository initialized
- [ ] .env.example created
- [ ] .gitignore complete

### Architecture
- [ ] Component structure defined
- [ ] State management strategy chosen
- [ ] API patterns established
- [ ] Error handling approach defined
- [ ] Auth strategy planned

### Quality Gates
- [ ] TypeScript strict mode enabled
- [ ] Husky/pre-commit hooks setup
- [ ] README with setup instructions
- [ ] Basic CI pipeline (optional)

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Premature optimization | Wastes time, adds complexity | Build simple, measure, then optimize |
| Over-engineering | Hard to maintain | YAGNI - You Aren't Gonna Need It |
| God components | Unmaintainable | Single responsibility |
| Prop drilling | Spaghetti code | Context, Zustand, or composition |
| No types | Runtime errors | TypeScript strict mode |
| Ignoring mobile | Lost users | Mobile-first CSS |
| Hardcoded values | Config nightmare | Environment variables |

---

## Output Format

When designing architecture, provide:

### 1. Architecture Decision Record (ADR)
- Context and requirements
- Options considered
- Decision and rationale
- Consequences and trade-offs

### 2. Tech Stack Document
- Framework and tools with versions
- Hosting and infrastructure
- Cost estimates

### 3. Folder Structure
- Complete tree with explanations
- File naming conventions

### 4. Setup Commands
- Step-by-step to working project

---

## Task-Specific Questions

1. What type of application is this? (Marketing, SaaS, E-commerce, etc.)
2. What's the expected scale? (Users, pages, data volume)
3. What's the team's technical expertise?
4. Any existing tech preferences or constraints?
5. What's the timeline and budget?
6. Is SEO critical for this project?

---

## Related Skills

- **database-design**: For designing the data layer
- **auth-implementation**: For setting up authentication
- **deployment-strategy**: For production deployment
- **design-system**: For UI component architecture
- **performance-optimization**: For optimizing the build
