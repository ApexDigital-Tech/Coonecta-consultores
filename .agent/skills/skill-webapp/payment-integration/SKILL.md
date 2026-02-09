---
name: payment-integration
version: 1.0.0
description: When the user wants to implement payments, subscriptions, or billing. Also use when the user mentions "Stripe," "payments," "subscriptions," "checkout," "billing," "pricing plans," "webhooks," or "invoices." For pricing page design, see pricing-strategy. For paywall optimization, see paywall-upgrade-cro.
---

# Payment Integration

You are an expert in payment systems and SaaS billing. Your goal is to help implement secure, reliable payment processing using Stripe as the primary provider, following best practices for subscriptions, webhooks, and customer management.

## Initial Assessment

**Check for existing project context first:**
Review existing Stripe setup, pricing model, and database schema before making recommendations.

Before implementing payments, understand:

1. **Business Model**
   - One-time payments or subscriptions?
   - How many pricing tiers?
   - Free trial offered?
   - Usage-based pricing?

2. **Tech Stack**
   - Framework? (Next.js, etc.)
   - Supabase for database?
   - Existing user system?

3. **Requirements**
   - Multiple currencies?
   - Tax handling (Stripe Tax)?
   - Invoicing needed?
   - Team/organization billing?

4. **Current State**
   - Stripe account exists?
   - Products created?
   - Webhook endpoint configured?

---

## Core Principles

### 1. Stripe is Source of Truth
For billing data, Stripe is authoritative.
- Sync from Stripe to your database
- Never store sensitive card data
- Use webhooks for state changes

### 2. Idempotent Webhooks
Webhooks may fire multiple times.
- Use event IDs to deduplicate
- Make handlers idempotent
- Log all webhook events

### 3. Graceful Degradation
Payment failures happen.
- Handle expired cards
- Dunning emails
- Grace periods

### 4. Test Everything
Use Stripe test mode extensively.
- Test all subscription states
- Test webhook handling
- Test failure scenarios

---

## Stripe Setup

### 1. Install Dependencies

```bash
npm install stripe @stripe/stripe-js
```

### 2. Environment Variables

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Stripe Client Setup

```typescript
// lib/stripe/server.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
});
```

```typescript
// lib/stripe/client.ts
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
```

---

## Database Schema

### Subscriptions Table

```sql
-- migrations/create_subscriptions.sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stripe IDs
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'inactive' 
    CHECK (status IN ('active', 'inactive', 'trialing', 'past_due', 'canceled', 'unpaid')),
  
  -- Dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Metadata
  plan_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Index for lookups
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());
```

### Products/Prices Reference

```sql
-- Optional: Cache Stripe products locally
CREATE TABLE products (
  id TEXT PRIMARY KEY, -- Stripe product ID
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  metadata JSONB
);

CREATE TABLE prices (
  id TEXT PRIMARY KEY, -- Stripe price ID
  product_id TEXT REFERENCES products(id),
  currency TEXT NOT NULL,
  unit_amount INTEGER NOT NULL,
  interval TEXT CHECK (interval IN ('month', 'year')),
  active BOOLEAN DEFAULT TRUE,
  metadata JSONB
);
```

---

## Checkout Flow

### Create Checkout Session

```typescript
// app/api/checkout/route.ts
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subscription?.stripe_customer_id) {
      stripeCustomerId = subscription.stripe_customer_id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Save customer ID
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
        status: 'inactive',
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          supabase_user_id: user.id,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### Checkout Button Component

```typescript
// components/checkout-button.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
  priceId: string;
  children: React.ReactNode;
}

export function CheckoutButton({ priceId, children }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCheckout() {
    setLoading(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { url, error } = await response.json();

      if (error) throw new Error(error);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error creating checkout session');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg 
                 hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
```

---

## Webhook Handling

### Webhook Endpoint

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Use service role for webhook (no user context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  // Get full subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscriptionId,
      stripe_price_id: subscription.items.data[0].price.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      plan_name: subscription.items.data[0].price.nickname,
    })
    .eq('stripe_customer_id', customerId);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0].price.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at 
        ? new Date(subscription.canceled_at * 1000).toISOString() 
        : null,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    })
    .eq('stripe_customer_id', customerId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  // Update status to past_due
  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_customer_id', customerId);

  // TODO: Send email notification
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  // Ensure status is active
  await supabase
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('stripe_customer_id', customerId);
}
```

---

## Customer Portal

### Create Portal Session

```typescript
// app/api/portal/route.ts
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
```

### Manage Subscription Button

```typescript
// components/manage-subscription.tsx
'use client';

import { useState } from 'react';

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    
    try {
      const response = await fetch('/api/portal', { method: 'POST' });
      const { url, error } = await response.json();
      
      if (error) throw new Error(error);
      
      window.location.href = url;
    } catch (error) {
      alert('Error opening billing portal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-blue-600 hover:underline disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Manage Subscription'}
    </button>
  );
}
```

---

## Subscription Hook

```typescript
// hooks/use-subscription.ts
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface Subscription {
  status: string;
  plan_name: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSubscription() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('subscriptions')
        .select('status, plan_name, current_period_end, cancel_at_period_end')
        .eq('user_id', user.id)
        .single();

      setSubscription(data);
      setLoading(false);
    }

    fetchSubscription();

    // Subscribe to changes
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions' },
        () => fetchSubscription()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isPro = isActive && subscription?.plan_name?.toLowerCase().includes('pro');

  return {
    subscription,
    loading,
    isActive,
    isPro,
  };
}
```

---

## Stripe Products Setup

### Create Products in Stripe Dashboard

```
Products to create:

1. Free Plan (optional, no Stripe product needed)

2. Pro Monthly
   - Product Name: Pro Plan
   - Price: $19/month
   - Price ID: price_pro_monthly
   
3. Pro Yearly
   - Product Name: Pro Plan (same product)
   - Price: $190/year (save ~17%)
   - Price ID: price_pro_yearly

4. Enterprise (contact sales - no automatic checkout)
```

### Configure Customer Portal

In Stripe Dashboard > Settings > Billing > Customer portal:

- ✅ Allow customers to update payment methods
- ✅ Allow customers to view invoice history
- ✅ Allow customers to cancel subscriptions
- ✅ Allow customers to switch plans
- Configure branding (colors, logo)

---

## Testing

### Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4242424242424242` | Successful payment |
| `4000000000000002` | Card declined |
| `4000002500003155` | Requires authentication |
| `4000000000009995` | Insufficient funds |

### Test Webhook Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

---

## Security Checklist

### Stripe Security
- [ ] Using HTTPS only
- [ ] Webhook signature verification
- [ ] Stripe keys in environment variables
- [ ] Test mode for development
- [ ] Idempotent webhook handlers

### Application Security
- [ ] User authenticated before checkout
- [ ] Price IDs validated server-side
- [ ] Customer ID belongs to user
- [ ] Service role key server-only

### PCI Compliance
- [ ] Using Stripe Checkout or Elements
- [ ] No card numbers in your code
- [ ] No card numbers in logs
- [ ] HTTPS everywhere

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Webhook signature invalid | Wrong secret or body parsing | Use raw body, check secret |
| Duplicate subscriptions | Webhook fires multiple times | Check for existing before insert |
| Customer not found | User has no Stripe customer | Create customer first |
| Portal not working | Portal not configured | Configure in Stripe Dashboard |
| Price ID invalid | Wrong environment (test/live) | Check API keys match prices |

---

## Output Format

When implementing payments, provide:

### 1. Database Schema
- Subscriptions table migration
- RLS policies

### 2. API Routes
- Checkout session creation
- Webhook handler
- Portal session creation

### 3. Components
- Checkout button
- Subscription status display
- Manage subscription button

### 4. Testing Guide
- Local webhook testing
- Test card numbers

---

## Task-Specific Questions

1. What's your pricing model? (monthly, yearly, both)
2. How many pricing tiers?
3. Do you offer a free trial?
4. Is there a free tier?
5. Do you need usage-based billing?
6. Multi-currency support needed?

---

## Related Skills

- **database-design**: For subscription schema
- **auth-implementation**: For user/customer linking
- **pricing-strategy**: For pricing page design
- **paywall-upgrade-cro**: For upgrade prompts
