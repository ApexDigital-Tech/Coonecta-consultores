---
name: ai-features
version: 1.0.0
description: When the user wants to integrate AI features like chatbots, text generation, or embeddings. Also use when the user mentions "AI," "OpenAI," "GPT," "embeddings," "vector search," "chat," "LLM," or "semantic search."
---

# AI Features

You are an expert in AI integration for web apps. Your goal is to help implement AI features using OpenAI, embeddings, and vector search with Supabase.

## AI Feature Types

| Feature | Use Case | Model |
|---------|----------|-------|
| **Chat** | Chatbots, assistants | GPT-4o |
| **Text Generation** | Content creation | GPT-4o |
| **Embeddings** | Semantic search, RAG | text-embedding-3-small |
| **Image Generation** | Visual content | DALL-E 3 |

---

## OpenAI Setup

### Installation

```bash
npm install openai ai
```

### Configuration

```typescript
// lib/openai.ts
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
```

```bash
# .env.local
OPENAI_API_KEY=sk-...
```

---

## Chat Completions

### Basic Chat API

```typescript
// app/api/chat/route.ts
import { openai } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { messages } = await request.json();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant for our app. Be concise and helpful.',
      },
      ...messages,
    ],
    max_tokens: 500,
  });

  return NextResponse.json({
    message: completion.choices[0].message,
  });
}
```

### Streaming Chat

```typescript
// app/api/chat/route.ts
import { openai } from '@/lib/openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
```

### Chat Component

```tsx
// components/chat.tsx
'use client';

import { useChat } from 'ai/react';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg ${
              m.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
            } max-w-[80%]`}
          >
            {m.content}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## Embeddings & Vector Search

### Enable pgvector

```sql
-- Enable the extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table with vector column
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI embedding dimension
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create similarity search index
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

### Generate Embeddings

```typescript
// lib/embeddings.ts
import { openai } from './openai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  
  return response.data[0].embedding;
}

export async function storeDocument(content: string, metadata?: object) {
  const embedding = await generateEmbedding(content);
  
  const { data, error } = await supabase
    .from('documents')
    .insert({
      content,
      embedding,
      metadata,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function searchDocuments(query: string, limit = 5) {
  const embedding = await generateEmbedding(query);
  
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: limit,
  });

  if (error) throw error;
  return data;
}
```

### Similarity Search Function

```sql
-- Create search function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## RAG (Retrieval Augmented Generation)

```typescript
// app/api/ask/route.ts
import { openai } from '@/lib/openai';
import { searchDocuments } from '@/lib/embeddings';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { question } = await request.json();

  // 1. Search relevant documents
  const docs = await searchDocuments(question, 3);
  
  // 2. Build context from documents
  const context = docs
    .map((doc) => doc.content)
    .join('\n\n---\n\n');

  // 3. Generate answer with context
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Answer the question based on the following context. If the context doesn't contain the answer, say so.

Context:
${context}`,
      },
      {
        role: 'user',
        content: question,
      },
    ],
  });

  return NextResponse.json({
    answer: completion.choices[0].message.content,
    sources: docs.map((d) => ({ id: d.id, similarity: d.similarity })),
  });
}
```

---

## Text Generation

### Content Generation

```typescript
// app/api/generate/route.ts
export async function POST(request: Request) {
  const { prompt, type } = await request.json();

  const systemPrompts = {
    blog: 'You are an expert blog writer. Write engaging, SEO-friendly content.',
    email: 'You are an email copywriter. Write persuasive, professional emails.',
    social: 'You are a social media expert. Write engaging, viral posts.',
  };

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompts[type] || systemPrompts.blog },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1000,
  });

  return NextResponse.json({
    content: completion.choices[0].message.content,
  });
}
```

---

## Cost Management

### Token Limits

```typescript
// Limit input tokens
import { encoding_for_model } from 'tiktoken';

function countTokens(text: string): number {
  const encoder = encoding_for_model('gpt-4o');
  const tokens = encoder.encode(text);
  encoder.free();
  return tokens.length;
}

function truncateToTokenLimit(text: string, maxTokens: number): string {
  const encoder = encoding_for_model('gpt-4o');
  const tokens = encoder.encode(text);
  
  if (tokens.length <= maxTokens) {
    encoder.free();
    return text;
  }
  
  const truncated = encoder.decode(tokens.slice(0, maxTokens));
  encoder.free();
  return truncated;
}
```

### Rate Limiting

```typescript
// Limit AI requests per user
const AI_REQUESTS_PER_DAY = 50;

// Check limit before processing
const { count } = await supabase
  .from('ai_requests')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

if (count >= AI_REQUESTS_PER_DAY) {
  return NextResponse.json({ error: 'Daily limit reached' }, { status: 429 });
}
```

---

## Checklist

- [ ] OpenAI API key secured
- [ ] Rate limiting implemented
- [ ] Token limits enforced
- [ ] Error handling for API failures
- [ ] User authentication required
- [ ] Usage tracked per user
- [ ] Streaming for long responses
- [ ] Embeddings indexed in database

---

## Related Skills

- **database-design**: For vector columns
- **security-hardening**: For API key protection
- **payment-integration**: For AI usage billing
