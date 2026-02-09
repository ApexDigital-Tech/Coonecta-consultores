---
name: email-transactional
version: 1.0.0
description: When the user wants to send transactional emails, set up email templates, or configure email delivery. Also use when the user mentions "email," "Resend," "SendGrid," "email templates," "welcome email," "password reset email," or "notifications."
---

# Transactional Email

You are an expert in transactional email systems. Your goal is to help implement reliable, beautiful email delivery using Resend.

## Why Resend?

- Modern API, great DX
- React Email for templates
- 3,000 free emails/month
- Excellent deliverability
- Simple setup

---

## Setup

### Installation

```bash
npm install resend @react-email/components
```

### Configuration

```typescript
// lib/email.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);
```

```bash
# .env.local
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=notifications@yourdomain.com
```

---

## Email Templates (React Email)

### Base Layout

```tsx
// emails/components/layout.tsx
import { Body, Container, Head, Html, Preview, Tailwind } from '@react-email/components';

interface LayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-xl">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
```

### Welcome Email

```tsx
// emails/welcome.tsx
import { Button, Heading, Section, Text } from '@react-email/components';
import { EmailLayout } from './components/layout';

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Welcome to our app, ${name}!`}>
      <Section className="bg-white rounded-lg p-8">
        <Heading className="text-2xl font-bold text-gray-900 mb-4">
          Welcome, {name}! 🎉
        </Heading>
        
        <Text className="text-gray-600 mb-6">
          Thanks for signing up. We're excited to have you on board.
          Here's what you can do next:
        </Text>
        
        <ul className="text-gray-600 mb-6 list-disc pl-5">
          <li>Complete your profile</li>
          <li>Explore our features</li>
          <li>Connect with others</li>
        </ul>
        
        <Button
          href={loginUrl}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          Get Started
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default WelcomeEmail;
```

### Password Reset Email

```tsx
// emails/password-reset.tsx
import { Button, Heading, Section, Text } from '@react-email/components';
import { EmailLayout } from './components/layout';

interface PasswordResetProps {
  resetUrl: string;
  expiresIn: string;
}

export function PasswordResetEmail({ resetUrl, expiresIn }: PasswordResetProps) {
  return (
    <EmailLayout preview="Reset your password">
      <Section className="bg-white rounded-lg p-8">
        <Heading className="text-2xl font-bold text-gray-900 mb-4">
          Reset Your Password
        </Heading>
        
        <Text className="text-gray-600 mb-6">
          We received a request to reset your password. Click the button below
          to choose a new password. This link expires in {expiresIn}.
        </Text>
        
        <Button
          href={resetUrl}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          Reset Password
        </Button>
        
        <Text className="text-gray-500 text-sm mt-6">
          If you didn't request this, you can safely ignore this email.
        </Text>
      </Section>
    </EmailLayout>
  );
}
```

### Invoice Email

```tsx
// emails/invoice.tsx
import { Column, Heading, Row, Section, Text } from '@react-email/components';
import { EmailLayout } from './components/layout';

interface InvoiceEmailProps {
  invoiceNumber: string;
  amount: string;
  date: string;
  items: Array<{ name: string; price: string }>;
  invoiceUrl: string;
}

export function InvoiceEmail({ invoiceNumber, amount, date, items, invoiceUrl }: InvoiceEmailProps) {
  return (
    <EmailLayout preview={`Invoice ${invoiceNumber} - ${amount}`}>
      <Section className="bg-white rounded-lg p-8">
        <Heading className="text-2xl font-bold mb-2">Invoice #{invoiceNumber}</Heading>
        <Text className="text-gray-500 mb-6">Date: {date}</Text>
        
        {items.map((item, i) => (
          <Row key={i} className="border-b py-2">
            <Column>{item.name}</Column>
            <Column className="text-right">{item.price}</Column>
          </Row>
        ))}
        
        <Row className="mt-4 font-bold">
          <Column>Total</Column>
          <Column className="text-right">{amount}</Column>
        </Row>
      </Section>
    </EmailLayout>
  );
}
```

---

## Sending Emails

### Send Function

```typescript
// lib/email.ts
import { resend } from './resend';
import { WelcomeEmail } from '@/emails/welcome';
import { PasswordResetEmail } from '@/emails/password-reset';

const FROM = process.env.EMAIL_FROM || 'noreply@yourdomain.com';

export async function sendWelcomeEmail(email: string, name: string) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Welcome to our app, ${name}!`,
    react: WelcomeEmail({ 
      name, 
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` 
    }),
  });

  if (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your password',
    react: PasswordResetEmail({ resetUrl, expiresIn: '1 hour' }),
  });

  if (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}
```

### From API Route

```typescript
// app/api/auth/signup/route.ts
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  const { email, name } = await request.json();
  
  // Create user...
  
  // Send welcome email (don't await - fire and forget)
  sendWelcomeEmail(email, name).catch(console.error);
  
  return Response.json({ success: true });
}
```

### From Supabase Trigger

```typescript
// supabase/functions/send-welcome-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  const { record } = await req.json();
  
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: record.email,
    subject: 'Welcome!',
    html: `<h1>Welcome, ${record.full_name}!</h1>`,
  });

  return new Response(JSON.stringify({ success: true }));
});
```

---

## Email Events

| Event | When to Send |
|-------|--------------|
| Welcome | After signup confirmation |
| Password Reset | User requests reset |
| Invoice | After successful payment |
| Subscription Updated | Plan change |
| Trial Ending | 3 days before trial ends |
| Payment Failed | Card declined |

---

## Preview Emails Locally

```bash
# Add to package.json
"scripts": {
  "email:dev": "email dev --port 3001"
}

# Run preview server
npm run email:dev
```

---

## Domain Setup (Resend)

1. Go to Resend Dashboard → Domains
2. Add your domain
3. Add DNS records (SPF, DKIM, DMARC)
4. Verify domain
5. Use `from: 'name@yourdomain.com'`

---

## Best Practices

- [ ] Use verified domain (not @resend.dev)
- [ ] Include unsubscribe link for marketing
- [ ] Plain text fallback
- [ ] Test on multiple email clients
- [ ] Handle errors gracefully
- [ ] Don't block user flow for emails

---

## Related Skills

- **auth-implementation**: For auth-related emails
- **payment-integration**: For billing emails
- **deployment-strategy**: For environment variables
