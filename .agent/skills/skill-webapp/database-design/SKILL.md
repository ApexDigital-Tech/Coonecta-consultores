---
name: database-design
version: 1.0.0
description: When the user wants to design, model, or structure a database. Also use when the user mentions "database schema," "data model," "tables," "migrations," "PostgreSQL," "Supabase database," "RLS policies," "foreign keys," or "relationships." For authentication tables, see auth-implementation. For security policies, see security-hardening.
---

# Database Design

You are an expert database architect. Your goal is to help design scalable, secure, and performant database schemas using PostgreSQL and Supabase, following best practices for data modeling and Row Level Security.

## Initial Assessment

**Check for existing project context first:**
Review existing migrations, schema files, and Supabase project before making recommendations.

Before designing the schema, understand:

1. **Domain Understanding**
   - What is the application about?
   - What are the core entities?
   - What are the main user actions?

2. **Scale Expectations**
   - Expected number of users?
   - Data volume per entity?
   - Read vs. write ratio?

3. **Requirements**
   - Multi-tenant or single-tenant?
   - Soft deletes needed?
   - Audit logging required?
   - Search requirements?

4. **Access Patterns**
   - Who accesses what data?
   - Role-based access?
   - Public vs. private data?

---

## Core Principles

### 1. Normalize First, Denormalize for Performance
Start with proper normalization (3NF), denormalize only when you have measured performance issues.

### 2. Design for Queries
Think about how data will be queried, not just stored.
- What queries will be most common?
- What filters will be applied?
- What sorting is needed?

### 3. Security by Default
Row Level Security (RLS) from day one.
- Every table should have RLS enabled
- Policies should be explicit allow, not deny
- Test policies thoroughly

### 4. Plan for Change
Schemas evolve. Design for flexibility.
- Use migrations for all changes
- Consider soft deletes
- Document your decisions

---

## Data Types Reference

### Common PostgreSQL Types

| Use Case | Type | Notes |
|----------|------|-------|
| Primary Key | `UUID` | Use `gen_random_uuid()` |
| Email | `TEXT` + constraint | Check valid format |
| Money | `DECIMAL(10,2)` | Never use FLOAT |
| Timestamps | `TIMESTAMPTZ` | Always with timezone |
| JSON | `JSONB` | Indexed JSON |
| Enum values | `TEXT` + CHECK | Or create ENUM type |
| Phone | `TEXT` | Store normalized |
| URL | `TEXT` | Validate in app |
| Boolean | `BOOLEAN` | Not NULL + default |

### UUID vs. Serial

**Use UUID:**
- Distributed systems
- Public-facing IDs
- Preventing enumeration
- Multi-tenant apps

**Use Serial/Identity:**
- Simple internal systems
- Performance critical
- Analytics tables

---

## Schema Design Patterns

### 1. User + Profile Pattern

```sql
-- Users table is managed by Supabase Auth
-- We create a profiles table linked to it

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_profiles_email ON profiles(email);
```

### 2. Multi-Tenant Pattern

```sql
-- Organizations (tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Index for fast organization lookups
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
```

### 3. Soft Delete Pattern

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  -- Soft delete columns
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- View for active posts only
CREATE VIEW active_posts AS
SELECT * FROM posts WHERE deleted_at IS NULL;

-- Soft delete function
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = NOW();
  NEW.deleted_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. Hierarchical Data (Categories)

```sql
-- Self-referencing for parent/child
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recursive query for tree
WITH RECURSIVE category_tree AS (
  SELECT id, name, parent_id, 0 as depth
  FROM categories
  WHERE parent_id IS NULL
  
  UNION ALL
  
  SELECT c.id, c.name, c.parent_id, ct.depth + 1
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY depth, name;
```

### 5. Tags/Labels (Many-to-Many)

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6366f1'
);

CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Query posts with tags
SELECT 
  p.*,
  COALESCE(
    json_agg(
      json_build_object('id', t.id, 'name', t.name, 'color', t.color)
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'
  ) as tags
FROM posts p
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY p.id;
```

### 6. Audit Log Pattern

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to a table
CREATE TRIGGER posts_audit
  AFTER INSERT OR UPDATE OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

---

## Row Level Security (RLS)

### Enable RLS

```sql
-- Always enable RLS on tables with user data
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner too (recommended)
ALTER TABLE posts FORCE ROW LEVEL SECURITY;
```

### Common RLS Policies

```sql
-- 1. Users can only see their own data
CREATE POLICY "Users view own posts"
  ON posts FOR SELECT
  USING (author_id = auth.uid());

-- 2. Users can insert their own data
CREATE POLICY "Users create own posts"
  ON posts FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- 3. Users can update their own data
CREATE POLICY "Users update own posts"
  ON posts FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- 4. Users can delete their own data
CREATE POLICY "Users delete own posts"
  ON posts FOR DELETE
  USING (author_id = auth.uid());

-- 5. Public read (e.g., published posts)
CREATE POLICY "Anyone can view published posts"
  ON posts FOR SELECT
  USING (status = 'published');

-- 6. Admin full access
CREATE POLICY "Admins have full access"
  ON posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Organization-based access (multi-tenant)
CREATE POLICY "Members access org data"
  ON projects FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

### RLS Helper Functions

```sql
-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check organization membership
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check organization role
CREATE OR REPLACE FUNCTION get_org_role(org_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM organization_members
    WHERE organization_id = org_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Indexes

### When to Create Indexes

| Scenario | Index Type |
|----------|------------|
| Equality lookups | B-tree (default) |
| Range queries | B-tree |
| Full-text search | GIN with tsvector |
| JSONB queries | GIN |
| Geospatial | GiST with PostGIS |
| Pattern matching (LIKE) | GIN with pg_trgm |

### Index Examples

```sql
-- Single column (most common)
CREATE INDEX idx_posts_author ON posts(author_id);

-- Composite (query uses both columns)
CREATE INDEX idx_posts_author_status ON posts(author_id, status);

-- Partial (only index what matters)
CREATE INDEX idx_active_posts ON posts(created_at)
  WHERE deleted_at IS NULL AND status = 'published';

-- JSONB field
CREATE INDEX idx_posts_metadata ON posts USING GIN (metadata);

-- Full-text search
ALTER TABLE posts ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(content, '')), 'B')
  ) STORED;

CREATE INDEX idx_posts_search ON posts USING GIN (search_vector);

-- Query full-text
SELECT * FROM posts
WHERE search_vector @@ plainto_tsquery('spanish', 'buscar texto');
```

---

## Migrations

### Migration File Naming

```
supabase/migrations/
├── 20240101000000_create_profiles.sql
├── 20240101000001_create_organizations.sql
├── 20240102000000_add_posts_table.sql
└── 20240103000000_add_search_index.sql
```

### Migration Template

```sql
-- Migration: create_posts_table
-- Description: Creates the posts table with RLS policies

-- Create table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published ON posts(published_at) 
  WHERE status = 'published';

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authors can manage own posts"
  ON posts FOR ALL
  USING (author_id = auth.uid());

CREATE POLICY "Anyone can view published posts"
  ON posts FOR SELECT
  USING (status = 'published');

-- Updated at trigger
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE posts IS 'Blog posts with draft/published workflow';
COMMENT ON COLUMN posts.slug IS 'URL-friendly unique identifier';
```

---

## TypeScript Types Generation

### Generate Types from Supabase

```bash
# Install Supabase CLI
npm install -D supabase

# Login
npx supabase login

# Generate types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

### Using Generated Types

```typescript
// types/database.ts (auto-generated)
export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          title: string;
          content: string | null;
          author_id: string;
          status: 'draft' | 'published' | 'archived';
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string | null;
          author_id: string;
          status?: 'draft' | 'published' | 'archived';
        };
        Update: {
          title?: string;
          content?: string | null;
          status?: 'draft' | 'published' | 'archived';
        };
      };
    };
  };
};

// Usage with Supabase client
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

const supabase = createClient<Database>(url, key);

// Fully typed queries
const { data: posts } = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published');

// posts is typed as Database['public']['Tables']['posts']['Row'][]
```

---

## Common Queries

### Pagination

```sql
-- Offset pagination (simple but slow for large offsets)
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 10 OFFSET 20;

-- Cursor pagination (better for large datasets)
SELECT * FROM posts
WHERE created_at < $1  -- cursor from last item
ORDER BY created_at DESC
LIMIT 10;
```

### Aggregations

```sql
-- Count by status
SELECT status, COUNT(*) as count
FROM posts
GROUP BY status;

-- Stats for dashboard
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'published') as published,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as this_week
FROM posts
WHERE author_id = auth.uid();
```

### Joins

```sql
-- Posts with author info
SELECT 
  p.*,
  json_build_object(
    'id', pr.id,
    'name', pr.full_name,
    'avatar', pr.avatar_url
  ) as author
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
WHERE p.status = 'published';
```

---

## Performance Checklist

### Indexes
- [ ] Primary keys defined
- [ ] Foreign keys have indexes
- [ ] Columns used in WHERE have indexes
- [ ] Columns used in ORDER BY have indexes
- [ ] Composite indexes for multi-column queries

### Queries
- [ ] Use SELECT only needed columns (not *)
- [ ] Pagination on list queries
- [ ] Avoid N+1 queries (use JOINs)
- [ ] EXPLAIN ANALYZE on slow queries

### Schema
- [ ] Appropriate data types (not TEXT for everything)
- [ ] NOT NULL where appropriate
- [ ] CHECK constraints for enums
- [ ] Default values where sensible

---

## Schema Documentation

### Template

```sql
-- Table comments
COMMENT ON TABLE posts IS 'Blog posts with draft/publish workflow';

-- Column comments
COMMENT ON COLUMN posts.slug IS 'URL-friendly unique identifier, auto-generated from title';
COMMENT ON COLUMN posts.status IS 'Workflow status: draft → published → archived';

-- Generate documentation
SELECT 
  c.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default,
  pgd.description
FROM information_schema.columns c
LEFT JOIN pg_catalog.pg_description pgd 
  ON pgd.objsubid = c.ordinal_position
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;
```

---

## Output Format

When designing a database, provide:

### 1. Entity Relationship Diagram (ERD)
```
[Users] 1──┬──N [Posts]
           │
           └──N [Comments]
```

### 2. Table Definitions
- Full CREATE TABLE statements
- Indexes
- Constraints

### 3. RLS Policies
- Policy for each table
- Helper functions if needed

### 4. Migrations
- Ordered migration files
- Rollback scripts if complex

### 5. TypeScript Types
- How to generate
- Custom type extensions

---

## Task-Specific Questions

1. What are the main entities in your application?
2. What are the relationships between them?
3. Who can access what data? (public, owner only, org members)
4. Do you need soft deletes?
5. What are the most common queries?
6. Any full-text search requirements?

---

## Related Skills

- **auth-implementation**: For user authentication setup
- **security-hardening**: For advanced RLS and security
- **web-architecture**: For overall application structure
- **api-design**: For designing data access layer
