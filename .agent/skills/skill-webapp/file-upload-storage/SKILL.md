---
name: file-upload-storage
version: 1.0.0
description: When the user wants to upload files, manage images, or use cloud storage. Also use when the user mentions "file upload," "images," "storage," "S3," "Supabase Storage," "CDN," or "media."
---

# File Upload & Storage

You are an expert in file handling and cloud storage. Your goal is to help implement secure, efficient file upload and storage using Supabase Storage.

## Supabase Storage Concepts

| Concept | Description |
|---------|-------------|
| **Bucket** | Container for files (like a folder) |
| **Object** | Individual file |
| **Policy** | RLS-like rules for access |
| **Signed URL** | Temporary URL for private files |

---

## Setup

### Create Bucket

```sql
-- Via SQL (or Supabase Dashboard)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false);
```

### Storage Policies

```sql
-- Public read for avatars
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update/delete own avatar
CREATE POLICY "Users manage own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Private documents - only owner
CREATE POLICY "Owner access documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Client Upload Component

### Image Upload

```typescript
// components/image-upload.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

interface ImageUploadProps {
  bucket: string;
  folder: string;
  onUpload: (url: string) => void;
  maxSizeMB?: number;
  accept?: string;
}

export function ImageUpload({
  bucket,
  folder,
  onUpload,
  maxSizeMB = 5,
  accept = 'image/*',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const supabase = createClient();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      alert('Only images allowed');
      return;
    }

    setUploading(true);
    setPreview(URL.createObjectURL(file));

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    setUploading(false);

    if (error) {
      alert('Upload failed: ' + error.message);
      setPreview(null);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    onUpload(publicUrl);
  }

  return (
    <div className="space-y-4">
      <label className="block cursor-pointer">
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          {preview ? (
            <img src={preview} alt="Preview" className="mx-auto max-h-48 rounded" />
          ) : (
            <div className="text-gray-500">
              <p>Click to upload image</p>
              <p className="text-sm">Max {maxSizeMB}MB</p>
            </div>
          )}
        </div>
        <input
          type="file"
          accept={accept}
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {uploading && <p className="text-center text-sm">Uploading...</p>}
    </div>
  );
}
```

### Avatar Upload with User ID

```typescript
// components/avatar-upload.tsx
'use client';

import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export function AvatarUpload({ currentAvatar }: { currentAvatar?: string }) {
  const { user } = useUser();
  const [avatar, setAvatar] = useState(currentAvatar);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    // Path: userId/avatar.ext
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    // Upload (upsert to replace existing)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      alert('Upload failed');
      setUploading(false);
      return;
    }

    // Get URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    // Update profile
    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    setAvatar(publicUrl + '?t=' + Date.now()); // Cache bust
    setUploading(false);
  }

  return (
    <label className="cursor-pointer group relative inline-block">
      <img
        src={avatar || '/default-avatar.png'}
        alt="Avatar"
        className="w-24 h-24 rounded-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
        <span className="text-white text-sm">
          {uploading ? 'Uploading...' : 'Change'}
        </span>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
      />
    </label>
  );
}
```

---

## Server-Side Upload

### API Route for Upload

```typescript
// app/api/upload/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Upload
  const ext = file.name.split('.').pop();
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(path, file);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ path: data.path });
}
```

---

## Download & Signed URLs

### Private File Download

```typescript
// For private files, get signed URL
async function getSignedUrl(path: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) throw error;
  return data.signedUrl;
}

// Download button component
function DownloadButton({ path, filename }: { path: string; filename: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const url = await getSignedUrl(path);
      window.open(url, '_blank');
    } catch (error) {
      alert('Download failed');
    }
    setLoading(false);
  }

  return (
    <button onClick={handleDownload} disabled={loading}>
      {loading ? 'Loading...' : `Download ${filename}`}
    </button>
  );
}
```

---

## Image Optimization

### Next.js Image with Supabase

```tsx
import Image from 'next/image';

// For public bucket images
<Image
  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`}
  alt="Avatar"
  width={100}
  height={100}
  className="rounded-full"
/>

// Or use supabaseLoader
const supabaseLoader = ({ src, width, quality }) => {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/${src}?width=${width}&quality=${quality || 75}`;
};

<Image
  loader={supabaseLoader}
  src="avatars/user123/avatar.jpg"
  alt="Avatar"
  width={100}
  height={100}
/>
```

---

## Delete Files

```typescript
// Delete single file
async function deleteFile(bucket: string, path: string) {
  const supabase = createClient();
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}

// Delete multiple files
async function deleteFiles(bucket: string, paths: string[]) {
  const supabase = createClient();
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths);

  if (error) throw error;
}
```

---

## File Type Validation

```typescript
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword'];

function validateFile(file: File, allowedTypes: string[], maxSizeMB: number) {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File must be less than ${maxSizeMB}MB` };
  }
  
  return { valid: true };
}
```

---

## Checklist

- [ ] Bucket created with correct visibility
- [ ] Storage policies configured
- [ ] File size limits enforced
- [ ] File type validation
- [ ] Unique filenames (prevent overwrites)
- [ ] User ownership in path
- [ ] Cleanup orphaned files

---

## Related Skills

- **database-design**: For file metadata in DB
- **security-hardening**: For upload security
- **performance-optimization**: For image optimization
