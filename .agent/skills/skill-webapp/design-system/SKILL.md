---
name: design-system
version: 1.0.0
description: When the user wants to create a design system, UI components, or styling architecture. Also use when the user mentions "design system," "UI components," "Tailwind," "theme," "dark mode," "colors," or "typography."
---

# Design System

You are an expert in design systems and UI architecture. Your goal is to help create consistent, maintainable, and beautiful interfaces.

## Core Principles

1. **Consistency** - Same patterns everywhere
2. **Reusability** - Build once, use many times  
3. **Accessibility** - WCAG 2.1 compliance
4. **Scalability** - Easy to extend and maintain

---

## Design Tokens

### Colors (Tailwind config)

```javascript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        // Semantic colors
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        // Neutral
        gray: { /* ... */ }
      },
    },
  },
};
```

### Typography

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

body {
  font-family: var(--font-sans);
  font-feature-settings: 'cv11', 'ss01';
  -webkit-font-smoothing: antialiased;
}
```

### Spacing Scale

```javascript
// Consistent spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96
spacing: {
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
}
```

---

## Component Library

### Button Component

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({ className, variant, size, isLoading, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} disabled={isLoading} {...props}>
      {isLoading && <Spinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
}
```

### Input Component

```typescript
// components/ui/input.tsx
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
```

### Card Component

```typescript
// components/ui/card.tsx
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl border bg-white p-6 shadow-sm', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold', className)}>{children}</h3>;
}

export function CardContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-gray-600', className)}>{children}</div>;
}
```

---

## Dark Mode

### Setup

```typescript
// tailwind.config.ts
module.exports = {
  darkMode: 'class', // or 'media'
};

// components/theme-provider.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: 'system', setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

### Dark Mode Classes

```css
/* Use dark: prefix */
.card {
  @apply bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100;
}
```

---

## Utility Function

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Component Patterns

### Polymorphic Component

```typescript
type AsChild<T> = T & { asChild?: boolean };

// Usage: <Button asChild><Link href="/">Home</Link></Button>
```

### Compound Components

```typescript
// Usage: 
// <Dropdown>
//   <Dropdown.Trigger>Open</Dropdown.Trigger>
//   <Dropdown.Content>
//     <Dropdown.Item>Option 1</Dropdown.Item>
//   </Dropdown.Content>
// </Dropdown>
```

---

## Responsive Design

```css
/* Mobile-first breakpoints */
/* sm: 640px, md: 768px, lg: 1024px, xl: 1280px */

.container {
  @apply px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto;
}

.grid-layout {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}
```

---

## Accessibility

```typescript
// Always include:
// - Proper labels for inputs
// - Alt text for images
// - Keyboard navigation
// - Focus indicators
// - ARIA attributes where needed

<button
  aria-label="Close dialog"
  aria-pressed={isPressed}
  tabIndex={0}
>
```

---

## File Structure

```
components/
├── ui/                 # Base components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── modal.tsx
├── forms/              # Form-specific
│   └── login-form.tsx
└── layout/             # Layout components
    ├── header.tsx
    └── footer.tsx
```

---

## Related Skills

- **web-architecture**: For project structure
- **responsive-design**: For mobile-first patterns
- **performance-optimization**: For component performance
