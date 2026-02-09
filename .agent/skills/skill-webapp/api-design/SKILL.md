---
name: api-design
version: 1.0.0
description: When the user wants to design APIs, implement REST endpoints, or structure backend logic. Also use when the user mentions "API," "REST," "endpoints," "routes," "GraphQL," "OpenAPI," or "server actions."
---

# API Design

You are an expert in API design and implementation. Your goal is to help create well-structured, secure, and maintainable APIs.

## API Patterns

| Pattern | Best For | Framework |
|---------|----------|-----------|
| **REST** | CRUD operations | Next.js API Routes |
| **Server Actions** | Form submissions | Next.js 14+ |
| **tRPC** | Full-stack TypeScript | Next.js + tRPC |
| **GraphQL** | Complex queries | Apollo, Yoga |

---

## Next.js API Routes (REST)

### Basic CRUD

```typescript
// app/api/posts/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// GET /api/posts
export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('posts')
    .select('*, author:profiles(name, avatar)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}

// POST /api/posts
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  published: z.boolean().default(false),
});

export async function POST(request: Request) {
  const supabase = createClient();
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate body
  const body = await request.json();
  const result = createPostSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    );
  }

  // Create
  const { data, error } = await supabase
    .from('posts')
    .insert({ ...result.data, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

### Single Resource Route

```typescript
// app/api/posts/[id]/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

type Params = { params: { id: string } };

// GET /api/posts/:id
export async function GET(request: Request, { params }: Params) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:profiles(name, avatar)')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH /api/posts/:id
export async function PATCH(request: Request, { params }: Params) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  
  const { data, error } = await supabase
    .from('posts')
    .update(body)
    .eq('id', params.id)
    .eq('user_id', user.id) // Only owner can update
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/posts/:id
export async function DELETE(request: Request, { params }: Params) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
```

---

## Server Actions (Next.js 14+)

### Form Actions

```typescript
// app/actions/posts.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function createPost(formData: FormData) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const result = postSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!result.success) {
    return { error: result.error.flatten() };
  }

  const { error } = await supabase
    .from('posts')
    .insert({ ...result.data, user_id: user.id });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/posts');
  redirect('/posts');
}

export async function deletePost(id: string) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  await supabase.from('posts').delete().eq('id', id).eq('user_id', user.id);
  
  revalidatePath('/posts');
}
```

### Usage in Form

```tsx
// app/posts/new/page.tsx
import { createPost } from '@/app/actions/posts';

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" required />
      <textarea name="content" placeholder="Content" required />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

---

## Response Patterns

### Standard Response Format

```typescript
// Success
{ data: T }
{ data: T[], meta: { total, page, limit } }

// Error
{ error: string }
{ error: string, details: object }

// Empty success
// 204 No Content
```

### Helper Functions

```typescript
// lib/api/response.ts
import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json({
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

---

## Error Handling

```typescript
// lib/api/errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number = 400,
    public code?: string
  ) {
    super(message);
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

// Usage
export async function GET() {
  try {
    // ... logic
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Middleware Pattern

```typescript
// lib/api/with-auth.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

type Handler = (
  request: Request,
  context: { params: any; user: any }
) => Promise<Response>;

export function withAuth(handler: Handler) {
  return async (request: Request, context: { params: any }) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return handler(request, { ...context, user });
  };
}

// Usage
export const GET = withAuth(async (request, { user }) => {
  // user is guaranteed to exist
  return NextResponse.json({ userId: user.id });
});
```

---

## Naming Conventions

| Resource | Endpoint | Method |
|----------|----------|--------|
| List | `/api/posts` | GET |
| Create | `/api/posts` | POST |
| Read | `/api/posts/:id` | GET |
| Update | `/api/posts/:id` | PATCH |
| Delete | `/api/posts/:id` | DELETE |
| Action | `/api/posts/:id/publish` | POST |

---

## Checklist

- [ ] Auth check on protected routes
- [ ] Input validation with Zod
- [ ] Proper HTTP status codes
- [ ] Consistent error format
- [ ] Pagination for lists
- [ ] Rate limiting
- [ ] CORS if needed

---

## Related Skills

- **database-design**: For data access patterns
- **auth-implementation**: For authentication
- **security-hardening**: For API security
