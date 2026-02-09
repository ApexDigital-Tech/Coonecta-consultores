---
name: pwa-implementation
version: 1.0.0
description: When the user wants to make their app work offline, install as PWA, or add native-like features. Also use when the user mentions "PWA," "offline," "service worker," "manifest," "installable," or "push notifications."
---

# PWA Implementation

You are an expert in Progressive Web Apps. Your goal is to help create installable, offline-capable web apps with native-like features.

## PWA Features

| Feature | Description |
|---------|-------------|
| **Installable** | Add to home screen |
| **Offline** | Works without internet |
| **Push Notifications** | Re-engage users |
| **Background Sync** | Sync when online |

---

## Setup with next-pwa

### Installation

```bash
npm install next-pwa
```

### Configuration

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
      },
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
      },
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others',
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

module.exports = withPWA({
  // other next config
});
```

---

## Web App Manifest

```json
// public/manifest.json
{
  "name": "My App",
  "short_name": "MyApp",
  "description": "Description of my app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### Link Manifest

```tsx
// app/layout.tsx
export const metadata = {
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'My App',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## Install Prompt

```typescript
// hooks/use-pwa-install.ts
'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    install,
  };
}
```

### Install Button

```tsx
// components/install-button.tsx
'use client';

import { usePWAInstall } from '@/hooks/use-pwa-install';

export function InstallButton() {
  const { canInstall, isInstalled, install } = usePWAInstall();

  if (isInstalled) {
    return <span className="text-green-600">✓ Installed</span>;
  }

  if (!canInstall) {
    return null;
  }

  return (
    <button
      onClick={install}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
    >
      Install App
    </button>
  );
}
```

---

## Offline Detection

```typescript
// hooks/use-online-status.ts
'use client';

import { useEffect, useState } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### Offline Banner

```tsx
// components/offline-banner.tsx
'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-yellow-500 text-black p-2 text-center z-50">
      You're offline. Some features may be unavailable.
    </div>
  );
}
```

---

## Offline Data with IndexedDB

```typescript
// lib/offline-storage.ts
import { openDB, DBSchema } from 'idb';

interface MyDB extends DBSchema {
  drafts: {
    key: string;
    value: {
      id: string;
      content: string;
      createdAt: Date;
    };
  };
}

const dbPromise = openDB<MyDB>('my-app', 1, {
  upgrade(db) {
    db.createObjectStore('drafts', { keyPath: 'id' });
  },
});

export async function saveDraft(draft: MyDB['drafts']['value']) {
  const db = await dbPromise;
  await db.put('drafts', draft);
}

export async function getDraft(id: string) {
  const db = await dbPromise;
  return db.get('drafts', id);
}

export async function getAllDrafts() {
  const db = await dbPromise;
  return db.getAll('drafts');
}

export async function deleteDraft(id: string) {
  const db = await dbPromise;
  return db.delete('drafts', id);
}
```

---

## Push Notifications (Optional)

```typescript
// Request permission
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Subscribe to push
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });

  // Send subscription to your server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
  });
}
```

---

## Icons Generation

```bash
# Use PWA Asset Generator
npx pwa-asset-generator ./logo.png ./public/icons \
  --manifest ./public/manifest.json \
  --index ./app/layout.tsx
```

Required sizes:
- 192x192 (required)
- 512x512 (required)
- 180x180 (Apple touch icon)
- Maskable versions

---

## Checklist

- [ ] manifest.json created
- [ ] Icons in all required sizes
- [ ] Service worker registered
- [ ] Offline page works
- [ ] Install prompt handled
- [ ] Theme color matches brand
- [ ] Apple meta tags added
- [ ] Lighthouse PWA audit passes

---

## Related Skills

- **performance-optimization**: For fast loading
- **design-system**: For native-like UI
- **realtime-features**: For offline sync
