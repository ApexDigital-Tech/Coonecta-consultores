---
name: deployment-strategy
version: 1.0.0
description: When the user wants to deploy, host, or publish a web application. Also use when the user mentions "deploy," "Vercel," "Netlify," "Cloudflare Pages," "CI/CD," "production," "staging," "environment variables," or "domain setup." For monitoring after deployment, see monitoring-observability.
---

# Deployment Strategy

You are an expert in modern web deployment and DevOps. Your goal is to help deploy applications securely, reliably, and with best practices for CI/CD, environment management, and zero-downtime deployments.

## Initial Assessment

**Check for existing project context first:**
Review `package.json`, existing deployment configs, and framework choice before making recommendations.

Before deploying, understand:

1. **Application Type**
   - Framework? (Next.js, Vite, Astro)
   - Static or dynamic?
   - API routes/serverless functions?

2. **Requirements**
   - Expected traffic?
   - Geographic distribution?
   - Uptime requirements?

3. **Current State**
   - Existing hosting?
   - Domain ownership?
   - CI/CD in place?

4. **Constraints**
   - Budget?
   - Team expertise?
   - Compliance requirements?

---

## Core Principles

### 1. Automate Everything
Manual deployments are error-prone.
- Git push triggers deploy
- Automated testing before deploy
- Rollback automation

### 2. Environment Parity
Dev, staging, and production should be as similar as possible.
- Same runtime versions
- Same environment variable structure
- Same build process

### 3. Immutable Deployments
Each deploy creates a new immutable version.
- Easy rollbacks
- Predictable behavior
- No "works on my machine"

### 4. Security First
Protect secrets and infrastructure.
- Never commit secrets
- Use environment variables
- Least privilege access

---

## Platform Decision Matrix

### Quick Reference

| Platform | Best For | Pricing | Limits |
|----------|----------|---------|--------|
| **Vercel** | Next.js, React | Free tier generous | 100GB bandwidth/mo |
| **Cloudflare Pages** | Static, Edge | Free tier excellent | Unlimited bandwidth |
| **Netlify** | JAMstack, forms | Free tier good | 100GB bandwidth/mo |
| **Railway** | Full-stack, databases | $5/mo credit | Pay per use |
| **Fly.io** | Containers, global | $5/mo credit | Pay per use |

### Detailed Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL (Recommended for Next.js)             │
├─────────────────────────────────────────────────────────────────┤
│ ✅ Native Next.js support (they created it)                    │
│ ✅ Automatic preview deployments                                │
│ ✅ Edge functions globally distributed                          │
│ ✅ Built-in analytics                                           │
│ ✅ Excellent DX                                                  │
│ ⚠️ Vendor lock-in for some features                            │
│ ⚠️ Can get expensive at scale                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE PAGES                             │
├─────────────────────────────────────────────────────────────────┤
│ ✅ Unlimited bandwidth (free!)                                  │
│ ✅ Global CDN included                                          │
│ ✅ Workers for serverless                                       │
│ ✅ Best for static/Astro sites                                  │
│ ⚠️ Next.js support via adapter (some limitations)              │
│ ⚠️ Build times can be slower                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Vercel Deployment

### Initial Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project (first time)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Project Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

### Environment Variables

```bash
# Add env vars via CLI
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production

# Pull env vars to local
vercel env pull .env.local
```

### GitHub Integration

1. Import project at vercel.com/new
2. Connect GitHub repository
3. Configure:
   - Build Command: `npm run build`
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install`

---

## Cloudflare Pages Deployment

### Initial Setup

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Create project
wrangler pages project create my-app
```

### For Vite/Astro (Static)

```bash
# Build
npm run build

# Deploy
wrangler pages deploy dist
```

### For Next.js (with @cloudflare/next-on-pages)

```bash
# Install adapter
npm install -D @cloudflare/next-on-pages

# Add to next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};
module.exports = nextConfig;
```

```toml
# wrangler.toml
name = "my-nextjs-app"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"
```

---

## Environment Management

### Environment Types

| Environment | Purpose | URL | Data |
|-------------|---------|-----|------|
| **Development** | Local dev | localhost:3000 | Seed/mock |
| **Preview** | PR review | pr-123.vercel.app | Staging DB |
| **Staging** | Pre-prod testing | staging.app.com | Staging DB |
| **Production** | Live users | app.com | Production DB |

### Environment Variable Structure

```bash
# .env.example (commit this)
# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email
RESEND_API_KEY=
```

```bash
# .env.local (never commit)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# ... actual values
```

### Supabase Branch Databases

```bash
# Create branch for preview
supabase branches create preview-feature-x

# Link to Vercel preview
# In Vercel > Settings > Environment Variables
# Add NEXT_PUBLIC_SUPABASE_URL for Preview only
```

---

## CI/CD Pipeline

### GitHub Actions for Vercel

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm run test
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

### Database Migrations in CI

```yaml
# .github/workflows/migrate.yml
name: Database Migrations

on:
  push:
    branches: [main]
    paths:
      - 'supabase/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
      
      - name: Run migrations
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## Domain Setup

### Vercel Custom Domain

```bash
# Add domain via CLI
vercel domains add myapp.com

# Or in dashboard:
# Settings > Domains > Add
```

### DNS Configuration

```
# For apex domain (myapp.com)
Type: A
Name: @
Value: 76.76.21.21

# For www subdomain
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL/HTTPS

- Vercel: Automatic (Let's Encrypt)
- Cloudflare: Automatic (Universal SSL)
- Custom: Upload certificate in dashboard

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] Type checking passes
- [ ] Linting passes
- [ ] No console.logs in production code
- [ ] Error boundaries in place

### Configuration
- [ ] Environment variables set for production
- [ ] vercel.json or equivalent configured
- [ ] Build command verified locally
- [ ] Output directory correct

### Security
- [ ] Secrets not in code
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting on API routes
- [ ] CORS configured correctly

### Performance
- [ ] Images optimized
- [ ] Bundle size acceptable
- [ ] No unused dependencies
- [ ] Caching headers set

### SEO & Analytics
- [ ] Meta tags in place
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Analytics tracking code
- [ ] Error tracking (Sentry)

### Database
- [ ] Migrations run
- [ ] RLS policies tested
- [ ] Indexes created
- [ ] Connection pooling configured

---

## Rollback Strategy

### Vercel Instant Rollback

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>

# Or in dashboard:
# Deployments > ... > Promote to Production
```

### Database Rollback

```sql
-- Create backup before migration
pg_dump -h host -U user -d dbname > backup.sql

-- Restore if needed
psql -h host -U user -d dbname < backup.sql
```

---

## Monitoring Post-Deploy

### Essential Checks

```bash
# After deploy, verify:
1. Homepage loads
2. Login works
3. API responds
4. Database connected
5. Logs clean in Vercel/platform
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const start = Date.now();
  
  try {
    // Check database
    const supabase = createClient();
    await supabase.from('profiles').select('id').limit(1);
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - start,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
```

---

## Cost Optimization

### Vercel

| Tip | Savings |
|-----|---------|
| Use Edge Runtime for simple functions | Lower compute cost |
| Enable caching headers | Less serverless invocations |
| Use ISR instead of SSR where possible | Fewer function calls |
| Clean up preview deployments | Storage savings |

### Supabase

| Tip | Savings |
|-----|---------|
| Use connection pooling | Fewer connections |
| Pause unused projects | $0 when paused |
| Delete old backups | Storage savings |
| Use RLS instead of server checks | Fewer edge function calls |

---

## Output Format

When creating deployment strategy, provide:

### 1. Platform Recommendation
- Which platform and why
- Cost estimate

### 2. Configuration Files
- vercel.json or equivalent
- GitHub Actions workflows

### 3. Environment Setup
- Variable list with descriptions
- How to manage secrets

### 4. Deployment Commands
- Step-by-step first deploy
- Ongoing deployment workflow

### 5. Monitoring Setup
- Health checks
- Error tracking

---

## Task-Specific Questions

1. What framework are you using?
2. Do you have a domain already?
3. What's your expected traffic?
4. Do you need preview deployments for PRs?
5. What's your budget for hosting?
6. Do you need multiple environments (staging)?

---

## Related Skills

- **web-architecture**: For app structure decisions
- **monitoring-observability**: For post-deploy monitoring
- **security-hardening**: For security headers and protection
- **performance-optimization**: For build optimization
