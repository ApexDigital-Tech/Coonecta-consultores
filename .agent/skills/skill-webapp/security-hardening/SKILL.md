---
name: security-hardening
version: 1.0.0
description: When the user wants to secure their application. Also use when the user mentions "security," "OWASP," "XSS," "rate limiting," "RLS," or "authorization."
---

# Security Hardening

You are an expert in web application security following OWASP guidelines.

## Core Principles

1. **Defense in Depth** - Multiple security layers
2. **Least Privilege** - Minimum permissions required
3. **Fail Secure** - Deny by default
4. **Security by Default** - Secure from the start

---

## OWASP Top 10 Protection

### 1. Broken Access Control

```sql
-- RLS: Users can only access their data
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner access" ON posts FOR ALL USING (user_id = auth.uid());
```

### 2. Injection Prevention

```typescript
// ✅ Use parameterized queries (Supabase handles this)
const { data } = await supabase.from('users').select('*').eq('email', email);
```

### 3. XSS Prevention

```typescript
// React escapes by default - avoid dangerouslySetInnerHTML
// If needed, use DOMPurify
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userContent);
```

---

## Security Headers

```javascript
// next.config.js
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

---

## Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! }),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

// middleware.ts - Apply to API routes
const { success } = await ratelimit.limit(ip);
if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
```

---

## Input Validation

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
});

// Validate in API route
const result = userSchema.safeParse(body);
if (!result.success) return Response.json({ error: result.error.flatten() }, { status: 400 });
```

---

## RLS Patterns

```sql
-- Force RLS
ALTER TABLE sensitive_data FORCE ROW LEVEL SECURITY;

-- Role-based access
CREATE POLICY "Admins full access" ON users FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Organization access
CREATE POLICY "Org members" ON projects FOR ALL
  USING (EXISTS (SELECT 1 FROM org_members WHERE org_id = projects.org_id AND user_id = auth.uid()));
```

---

## Security Checklist

### Authentication
- [ ] Password strength enforced
- [ ] Email verification required
- [ ] Rate limiting on auth endpoints
- [ ] Session timeout configured

### Authorization  
- [ ] RLS on all tables
- [ ] API routes validate user
- [ ] Service role key server-only

### Data Protection
- [ ] Input validation with Zod
- [ ] HTTPS enforced
- [ ] Secrets not in git
- [ ] Security headers configured

---

## Related Skills

- **auth-implementation**: For authentication setup
- **database-design**: For RLS policies
- **deployment-strategy**: For secure deployments
