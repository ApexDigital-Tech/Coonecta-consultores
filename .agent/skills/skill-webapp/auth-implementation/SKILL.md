---
name: auth-implementation
version: 1.0.0
description: When the user wants to implement user authentication, login systems, or access control. Also use when the user mentions "auth," "login," "signup," "authentication," "OAuth," "JWT," "session management," "Supabase Auth," "magic links," or "password reset." For authorization and RLS policies, see security-hardening. For signup flow optimization, see signup-flow-cro.
---

# Authentication Implementation

You are an expert in authentication systems and security. Your goal is to help implement secure, user-friendly authentication that follows industry best practices using Supabase Auth as the primary provider.

## Initial Assessment

**Check for existing project context first:**
Review `package.json`, Supabase project status, and existing auth code before making recommendations.

Before implementing auth, understand:

1. **Auth Requirements**
   - What auth methods? (Email/password, OAuth, Magic links)
   - User roles needed?
   - Multi-tenant or single-tenant?

2. **Tech Stack**
   - Framework? (Next.js, Vite, etc.)
   - Supabase project exists?
   - Existing user database?

3. **User Experience**
   - Onboarding flow preference?
   - Password requirements?
   - Session duration?

4. **Security Requirements**
   - MFA required?
   - Email verification required?
   - Rate limiting concerns?

---

## Core Principles

### 1. Security First
Never compromise security for convenience.
- Use proven libraries (Supabase Auth, NextAuth)
- Never store passwords in plain text
- Always use HTTPS
- Validate on both client and server

### 2. Defense in Depth
Multiple layers of protection.
- Client-side validation
- Server-side validation
- Row Level Security (RLS)
- Rate limiting

### 3. User Experience
Auth should be seamless.
- Clear error messages
- Fast feedback
- Remember user preferences
- Social login options

### 4. Progressive Security
Start simple, add complexity when needed.
- Begin with email/password
- Add OAuth for convenience
- Add MFA for sensitive apps

---

## Supabase Auth Setup

### 1. Initial Configuration

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie errors in server components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie errors
          }
        },
      },
    }
  );
}
```

### 2. Middleware Setup

```typescript
// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh session if exists
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  const protectedPaths = ['/dashboard', '/settings', '/account'];
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect logged-in users from auth pages
  const authPaths = ['/login', '/signup'];
  const isAuthPage = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## Authentication Flows

### Email/Password Signup

```typescript
// actions/auth.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener una mayúscula')
    .regex(/[0-9]/, 'Debe contener un número'),
  name: z.string().min(2, 'Nombre muy corto'),
});

export async function signup(formData: FormData) {
  const supabase = createClient();

  const result = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
  });

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { email, password, name } = result.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: { form: [error.message] } };
  }

  // Email sent for verification
  redirect('/verify-email');
}
```

### Email/Password Login

```typescript
// actions/auth.ts
export async function login(formData: FormData) {
  const supabase = createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email o contraseña incorrectos' };
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Por favor, confirma tu email primero' };
    }
    return { error: error.message };
  }

  redirect('/dashboard');
}
```

### OAuth Login (Google)

```typescript
// actions/auth.ts
export async function loginWithGoogle() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(data.url);
}
```

### OAuth Callback Handler

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard';

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
```

### Magic Link Login

```typescript
// actions/auth.ts
export async function loginWithMagicLink(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
```

### Password Reset

```typescript
// actions/auth.ts
export async function requestPasswordReset(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePassword(password: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/login?message=password-updated');
}
```

### Logout

```typescript
// actions/auth.ts
export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}
```

---

## UI Components

### Login Form

```typescript
// components/auth/login-form.tsx
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { login, loginWithGoogle } from '@/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg 
                 hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
    </button>
  );
}

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 
                       focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 
                       focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <SubmitButton />
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-1 border-t" />
        <span className="px-4 text-sm text-gray-500">o continúa con</span>
        <div className="flex-1 border-t" />
      </div>

      <form action={loginWithGoogle}>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 
                     border py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <GoogleIcon />
          Google
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <a href="/signup" className="text-blue-600 hover:underline">
          Regístrate
        </a>
      </p>
    </div>
  );
}
```

### Auth Context Hook

```typescript
// hooks/use-user.ts
'use client';

import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, loading };
}
```

---

## User Profiles Table

### Migration

```sql
-- migrations/001_create_profiles.sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## OAuth Provider Setup

### Google OAuth

1. **Google Cloud Console:**
   - Create project at console.cloud.google.com
   - OAuth consent screen → External
   - Credentials → OAuth 2.0 Client ID
   - Authorized redirect URIs: 
     - `https://<project>.supabase.co/auth/v1/callback`

2. **Supabase Dashboard:**
   - Authentication → Providers → Google
   - Add Client ID and Secret

### GitHub OAuth

1. **GitHub:**
   - Settings → Developer settings → OAuth Apps
   - Homepage URL: Your app URL
   - Callback URL: `https://<project>.supabase.co/auth/v1/callback`

2. **Supabase Dashboard:**
   - Authentication → Providers → GitHub
   - Add Client ID and Secret

---

## Security Checklist

### Authentication
- [ ] Passwords hashed (Supabase handles this)
- [ ] Email verification enabled
- [ ] Password strength requirements
- [ ] Rate limiting on auth endpoints
- [ ] Secure session management

### Authorization
- [ ] RLS policies on all tables
- [ ] Role-based access control
- [ ] API route protection
- [ ] Middleware for protected routes

### Tokens
- [ ] Short access token lifetime (1 hour)
- [ ] Secure refresh token storage
- [ ] Token rotation on refresh
- [ ] Logout invalidates tokens

### Headers & Cookies
- [ ] HttpOnly cookies
- [ ] Secure flag in production
- [ ] SameSite=Lax or Strict
- [ ] CSRF protection

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid login credentials" | Wrong password or unconfirmed email | Check email confirmed, reset password |
| Session not persisting | Cookie issues | Check middleware, domain settings |
| OAuth redirect fails | Wrong callback URL | Verify URL in provider + Supabase |
| User metadata missing | Not passed on signup | Use `options.data` in signUp |
| Profile not created | Trigger not working | Check function permissions |

---

## Testing Auth

### Manual Tests
1. Signup → Email received → Click link → Logged in
2. Login → Success → Redirected to dashboard
3. Logout → Session cleared → Not authed
4. Protected route → Not logged in → Redirect to login
5. OAuth → Provider consent → Logged in

### E2E Test Example

```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign up and login', async ({ page }) => {
  // Signup
  await page.goto('/signup');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123');
  await page.fill('[name="name"]', 'Test User');
  await page.click('button[type="submit"]');
  
  // Verify redirect to verification
  await expect(page).toHaveURL('/verify-email');
});
```

---

## Output Format

When implementing auth, provide:

### 1. Setup Steps
- Dependencies to install
- Environment variables needed
- Supabase configuration

### 2. Code Files
- Server/client setup
- Middleware
- Auth actions
- UI components

### 3. Database Migrations
- Profiles table
- RLS policies
- Triggers

### 4. Testing Checklist
- Manual verification steps
- Security checks

---

## Task-Specific Questions

1. What auth methods do you need? (email, OAuth, magic links)
2. Is email verification required?
3. What OAuth providers? (Google, GitHub, etc.)
4. Do you need user roles?
5. Is this Next.js App Router or Pages Router?
6. Is MFA required?

---

## Related Skills

- **database-design**: For user profiles and related tables
- **security-hardening**: For RLS policies and authorization
- **web-architecture**: For overall app structure
- **signup-flow-cro**: For optimizing the signup experience
- **email-transactional**: For auth emails customization
