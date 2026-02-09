---
name: monitoring-observability
version: 1.0.0
description: When the user wants to monitor their app, track errors, or analyze logs. Also use when the user mentions "monitoring," "Sentry," "logs," "alerts," "errors," "APM," "observability," or "analytics."
---

# Monitoring & Observability

You are an expert in application monitoring. Your goal is to help implement comprehensive error tracking, logging, and observability.

## Observability Stack

| Tool | Purpose | Cost |
|------|---------|------|
| **Sentry** | Error tracking | Free tier |
| **Vercel Analytics** | Web Vitals, traffic | Included |
| **Axiom** | Logs & traces | Free tier |
| **Uptime Robot** | Uptime monitoring | Free |

---

## Sentry Setup

### Installation

```bash
npx @sentry/wizard@latest -i nextjs
```

### Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Error Boundary

```tsx
// app/error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

### Manual Error Capture

```typescript
import * as Sentry from '@sentry/nextjs';

// Capture exception with context
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'checkout' },
    extra: { userId: user.id, orderId },
  });
  throw error;
}

// Capture message
Sentry.captureMessage('User did unexpected action', {
  level: 'warning',
  tags: { action: 'delete_all' },
});
```

### Set User Context

```typescript
// After login
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// On logout
Sentry.setUser(null);
```

---

## Vercel Analytics

### Setup

```bash
npm install @vercel/analytics @vercel/speed-insights
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Track Custom Events

```typescript
import { track } from '@vercel/analytics';

// Track button click
track('signup_clicked', { plan: 'pro' });

// Track purchase
track('purchase', { 
  value: 99, 
  currency: 'USD',
  product: 'Pro Plan',
});
```

---

## Logging

### Structured Logging

```typescript
// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

class Logger {
  private context: LogContext = {};

  setContext(ctx: LogContext) {
    this.context = { ...this.context, ...ctx };
  }

  private log(level: LogLevel, message: string, data?: object) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...data,
    };

    if (process.env.NODE_ENV === 'production') {
      // Send to logging service
      console[level](JSON.stringify(logEntry));
    } else {
      console[level](message, data);
    }
  }

  debug(message: string, data?: object) {
    this.log('debug', message, data);
  }

  info(message: string, data?: object) {
    this.log('info', message, data);
  }

  warn(message: string, data?: object) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error, data?: object) {
    this.log('error', message, { 
      error: error?.message, 
      stack: error?.stack,
      ...data,
    });
  }
}

export const logger = new Logger();
```

### Request Logging Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const start = Date.now();

  const response = NextResponse.next();
  
  // Add request ID to headers
  response.headers.set('x-request-id', requestId);

  // Log request (in production, send to logging service)
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    duration: Date.now() - start,
    status: response.status,
  }));

  return response;
}
```

---

## Health Check Endpoint

```typescript
// app/api/health/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
  };

  try {
    const supabase = createClient();
    await supabase.from('profiles').select('id').limit(1);
    checks.database = true;
  } catch (error) {
    console.error('Health check failed:', error);
  }

  const healthy = checks.database;

  return NextResponse.json(
    { status: healthy ? 'healthy' : 'unhealthy', checks },
    { status: healthy ? 200 : 503 }
  );
}
```

---

## Uptime Monitoring

### Uptime Robot Setup

1. Create account at uptimerobot.com
2. Add monitor:
   - URL: `https://yourapp.com/api/health`
   - Interval: 5 minutes
   - Alert contacts: Email, Slack

### Status Page

```typescript
// app/status/page.tsx
export default async function StatusPage() {
  const services = [
    { name: 'API', url: '/api/health' },
    { name: 'Auth', url: '/api/auth/health' },
  ];

  const statuses = await Promise.all(
    services.map(async (service) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}${service.url}`);
        return { ...service, status: res.ok ? 'operational' : 'degraded' };
      } catch {
        return { ...service, status: 'outage' };
      }
    })
  );

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">System Status</h1>
      {statuses.map((service) => (
        <div key={service.name} className="flex justify-between py-3 border-b">
          <span>{service.name}</span>
          <span className={
            service.status === 'operational' ? 'text-green-600' :
            service.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
          }>
            {service.status}
          </span>
        </div>
      ))}
    </div>
  );
}
```

---

## Alerting

### Sentry Alerts

- Error spike: > 10 errors/minute
- New issue: First occurrence
- Regression: Previously resolved

### Slack Integration

```typescript
// lib/slack-alert.ts
export async function sendSlackAlert(message: string, severity: 'info' | 'warning' | 'error') {
  const colors = { info: '#36a64f', warning: '#ff9800', error: '#f44336' };
  
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [{
        color: colors[severity],
        text: message,
        ts: Math.floor(Date.now() / 1000),
      }],
    }),
  });
}
```

---

## Checklist

- [ ] Sentry configured for client & server
- [ ] Error boundaries in place
- [ ] User context set on login
- [ ] Health check endpoint
- [ ] Uptime monitoring active
- [ ] Alert channels configured
- [ ] Structured logging
- [ ] Web Vitals tracking

---

## Related Skills

- **deployment-strategy**: For deploy monitoring
- **security-hardening**: For security alerts
- **performance-optimization**: For performance monitoring
