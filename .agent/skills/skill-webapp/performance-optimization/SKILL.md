---
name: performance-optimization
version: 1.0.0
description: When the user wants to improve performance, speed, or Core Web Vitals. Also use when the user mentions "performance," "speed," "LCP," "CLS," "loading time," "bundle size," or "optimization."
---

# Performance Optimization

You are an expert in web performance optimization. Your goal is to achieve excellent Core Web Vitals and fast user experiences.

## Core Web Vitals Targets

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5-4s | > 4s |
| **INP** (Interaction to Next Paint) | < 200ms | 200-500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |

---

## Image Optimization

### Next.js Image Component

```tsx
import Image from 'next/image';

// ✅ Optimized
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // For above-fold images
  placeholder="blur"
  blurDataURL="data:image/..."
/>

// For responsive images
<Image
  src="/product.jpg"
  alt="Product"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover"
/>
```

### Image Formats

```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
};
```

---

## Code Splitting

### Dynamic Imports

```tsx
import dynamic from 'next/dynamic';

// Heavy component loaded on demand
const Chart = dynamic(() => import('./Chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Client-only
});

// Route-based splitting (automatic in App Router)
```

### Bundle Analysis

```bash
# Analyze bundle
npm install -D @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({});

# Run analysis
ANALYZE=true npm run build
```

---

## Font Optimization

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

---

## Caching Strategies

### Static Generation (Best Performance)

```tsx
// Static at build time
export default function Page() {
  return <div>Static content</div>;
}

// With revalidation (ISR)
export const revalidate = 3600; // Revalidate every hour
```

### Cache Headers

```typescript
// API route with caching
export async function GET() {
  const data = await fetchData();
  
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

### React Query Caching

```typescript
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000,   // 30 minutes
});
```

---

## Loading States

### Suspense Boundaries

```tsx
import { Suspense } from 'react';

<Suspense fallback={<TableSkeleton />}>
  <DataTable />
</Suspense>
```

### Skeleton Components

```tsx
function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-40 bg-gray-200 rounded-lg" />
      <div className="h-4 bg-gray-200 rounded mt-4 w-3/4" />
      <div className="h-4 bg-gray-200 rounded mt-2 w-1/2" />
    </div>
  );
}
```

---

## Lazy Loading

```tsx
// Intersection Observer for lazy content
import { useInView } from 'react-intersection-observer';

function LazyComponent() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref}>
      {inView ? <HeavyComponent /> : <Placeholder />}
    </div>
  );
}
```

---

## Third-Party Scripts

```tsx
// app/layout.tsx
import Script from 'next/script';

// Load after page interactive
<Script src="https://analytics.com/script.js" strategy="afterInteractive" />

// Load when idle
<Script src="https://chat-widget.com/widget.js" strategy="lazyOnload" />
```

---

## Database Performance

```sql
-- Add indexes for common queries
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- Partial index for active records
CREATE INDEX idx_active_users ON users(created_at) 
  WHERE status = 'active';

-- Use EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM posts WHERE author_id = 'xxx';
```

---

## Performance Checklist

### Build Time
- [ ] Analyze bundle size
- [ ] Remove unused dependencies
- [ ] Use dynamic imports for heavy components
- [ ] Tree shaking working

### Images
- [ ] Using Next.js Image or equivalent
- [ ] WebP/AVIF formats
- [ ] Proper sizing (not larger than needed)
- [ ] Lazy loading below fold

### Fonts
- [ ] Using next/font or font-display: swap
- [ ] Subset to used characters
- [ ] Preload critical fonts

### JavaScript
- [ ] Code splitting per route
- [ ] Defer non-critical scripts
- [ ] No blocking scripts in head

### CSS
- [ ] Purge unused styles (Tailwind default)
- [ ] Critical CSS inlined
- [ ] No large CSS files blocking

### API/Data
- [ ] Caching implemented
- [ ] Pagination for lists
- [ ] Database indexes
- [ ] Connection pooling

---

## Monitoring Tools

| Tool | Use |
|------|-----|
| **PageSpeed Insights** | Core Web Vitals |
| **Lighthouse** | In-browser audit |
| **WebPageTest** | Detailed waterfall |
| **Vercel Analytics** | Real user metrics |
| **Chrome DevTools** | Network, Performance tabs |

---

## Quick Wins

1. **Use server components** (Next.js default)
2. **Priority for hero images** (`priority` prop)
3. **Font optimization** (next/font)
4. **Static generation** where possible
5. **Lazy load below-fold content**

---

## Related Skills

- **web-architecture**: For performance-first architecture
- **deployment-strategy**: For CDN and caching
- **design-system**: For optimized components
