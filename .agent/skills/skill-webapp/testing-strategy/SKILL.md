---
name: testing-strategy
version: 1.0.0
description: When the user wants to implement tests, testing infrastructure, or quality assurance. Also use when the user mentions "testing," "unit tests," "E2E tests," "Playwright," "Jest," "Vitest," "test coverage," or "CI testing."
---

# Testing Strategy

You are an expert in software testing and quality assurance. Your goal is to help implement comprehensive testing strategies for web applications.

## Testing Pyramid

```
        ╱╲
       ╱  ╲       E2E Tests (few, slow, expensive)
      ╱────╲
     ╱      ╲     Integration Tests (some)
    ╱────────╲
   ╱          ╲   Unit Tests (many, fast, cheap)
  ╱────────────╲
```

---

## Test Types

| Type | What | Tools | Speed |
|------|------|-------|-------|
| **Unit** | Functions, hooks | Vitest, Jest | Fast |
| **Integration** | Components, API | Testing Library | Medium |
| **E2E** | Full user flows | Playwright | Slow |

---

## Setup: Vitest + Testing Library

### Installation

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
```

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Unit Tests

### Utility Functions

```typescript
// lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, slugify } from './utils';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1999, 'USD')).toBe('$19.99');
  });

  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
});

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world');
  });
});
```

### Custom Hooks

```typescript
// hooks/use-counter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './use-counter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments correctly', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(6);
  });
});
```

---

## Component Tests

### Basic Component

```typescript
// components/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Form Component

```typescript
// components/login-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  it('shows validation errors for empty fields', async () => {
    render(<LoginForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('submits with valid data', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

---

## API/Integration Tests

### API Route Testing

```typescript
// app/api/users/route.test.ts
import { GET, POST } from './route';
import { createMockRequest } from '@/tests/helpers';

describe('GET /api/users', () => {
  it('returns users list', async () => {
    const request = createMockRequest({ method: 'GET' });
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('POST /api/users', () => {
  it('creates a new user', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { email: 'new@example.com', name: 'New User' },
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(201);
  });

  it('validates required fields', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {},
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(400);
  });
});
```

---

## E2E Tests (Playwright)

### Installation

```bash
npm install -D @playwright/test
npx playwright install
```

### Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign up', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="name"]', 'Test User');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/verify-email');
    await expect(page.getByText('Check your email')).toBeVisible();
  });

  test('user can log in', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'existing@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });
});
```

```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('user can upgrade to pro', async ({ page }) => {
    await page.goto('/pricing');
    await page.click('button:has-text("Upgrade to Pro")');
    
    // Should redirect to Stripe
    await expect(page).toHaveURL(/checkout\.stripe\.com/);
  });
});
```

---

## Mocking

### Mock Supabase

```typescript
// tests/mocks/supabase.ts
import { vi } from 'vitest';

export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));
```

### Mock API Calls

```typescript
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

beforeEach(() => {
  (fetch as any).mockResolvedValue({
    ok: true,
    json: async () => ({ data: 'mocked' }),
  });
});
```

---

## CI Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Coverage Goals

| Type | Coverage Goal |
|------|---------------|
| Utilities | 90%+ |
| Hooks | 80%+ |
| Components | 70%+ |
| API Routes | 80%+ |
| E2E Critical Paths | 100% |

---

## Checklist

- [ ] Unit tests for utility functions
- [ ] Component tests for UI
- [ ] Integration tests for API routes
- [ ] E2E tests for critical user flows
- [ ] CI pipeline runs all tests
- [ ] Coverage reports generated
- [ ] Tests run before deploy

---

## Related Skills

- **web-architecture**: For testable code structure
- **deployment-strategy**: For CI/CD integration
- **security-hardening**: For security testing
