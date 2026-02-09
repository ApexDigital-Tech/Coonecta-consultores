---
name: realtime-features
version: 1.0.0
description: When the user wants to implement real-time features, live updates, or WebSocket connections. Also use when the user mentions "realtime," "live updates," "WebSocket," "presence," "notifications," "chat," or "collaborative."
---

# Realtime Features

You are an expert in real-time web applications. Your goal is to help implement live updates, presence, and real-time synchronization using Supabase Realtime.

## Use Cases

| Feature | Pattern |
|---------|---------|
| Live notifications | Broadcast |
| Chat messages | Postgres Changes |
| Online presence | Presence |
| Collaborative editing | Broadcast + Presence |
| Live dashboards | Postgres Changes |

---

## Supabase Realtime Setup

### Enable Realtime on Table

```sql
-- Enable realtime for a table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Or via Supabase Dashboard:
-- Database → Publications → supabase_realtime → Add table
```

---

## Postgres Changes (Database Sync)

### Listen to Table Changes

```typescript
// hooks/use-realtime-messages.ts
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

export function useRealtimeMessages(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Fetch initial messages
    supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []));

    // Subscribe to changes
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabase]);

  return messages;
}
```

### Usage in Component

```tsx
// components/chat-room.tsx
function ChatRoom({ roomId }: { roomId: string }) {
  const messages = useRealtimeMessages(roomId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
      <MessageInput roomId={roomId} />
    </div>
  );
}
```

---

## Broadcast (Ephemeral Messages)

### Real-time Cursor Positions

```typescript
// hooks/use-cursor-broadcast.ts
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface CursorPosition {
  odO userId: string;
  x: number;
  y: number;
}

export function useCursorBroadcast(roomId: string, userId: string) {
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel(`cursors:${roomId}`);

    // Listen for other cursors
    channel.on('broadcast', { event: 'cursor' }, ({ payload }) => {
      if (payload.userId !== userId) {
        setCursors((prev) => new Map(prev).set(payload.userId, payload));
      }
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, userId, supabase]);

  // Function to broadcast own cursor
  const broadcastCursor = (x: number, y: number) => {
    supabase.channel(`cursors:${roomId}`).send({
      type: 'broadcast',
      event: 'cursor',
      payload: { userId, x, y },
    });
  };

  return { cursors, broadcastCursor };
}
```

---

## Presence (Who's Online)

### Track Online Users

```typescript
// hooks/use-presence.ts
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

interface UserPresence {
  id: string;
  name: string;
  avatar?: string;
  online_at: string;
}

export function usePresence(roomId: string, currentUser: UserPresence) {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: currentUser.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<UserPresence>();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            ...currentUser,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, currentUser, supabase]);

  return onlineUsers;
}
```

### Online Indicator Component

```tsx
// components/online-users.tsx
function OnlineUsers({ roomId }: { roomId: string }) {
  const { user } = useUser();
  const onlineUsers = usePresence(roomId, {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
  });

  return (
    <div className="flex -space-x-2">
      {onlineUsers.map((u) => (
        <div
          key={u.id}
          className="relative"
          title={u.name}
        >
          <img
            src={u.avatar || '/default-avatar.png'}
            alt={u.name}
            className="w-8 h-8 rounded-full border-2 border-white"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        </div>
      ))}
    </div>
  );
}
```

---

## Live Notifications

```typescript
// hooks/use-notifications.ts
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useNotifications(userId: string) {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new;
          
          // Show toast
          toast(notification.title, {
            description: notification.message,
          });
          
          // Optionally play sound
          new Audio('/notification.mp3').play();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);
}
```

---

## Typing Indicators

```typescript
// hooks/use-typing-indicator.ts
export function useTypingIndicator(roomId: string, userId: string) {
  const supabase = createClient();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`typing:${roomId}`);

    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload.userId !== userId) {
        setTypingUsers((prev) => 
          payload.isTyping 
            ? [...new Set([...prev, payload.userId])]
            : prev.filter((id) => id !== payload.userId)
        );
      }
    });

    channel.subscribe();

    return () => supabase.removeChannel(channel);
  }, [roomId, userId, supabase]);

  const setTyping = (isTyping: boolean) => {
    supabase.channel(`typing:${roomId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping },
    });
  };

  return { typingUsers, setTyping };
}
```

---

## Performance Tips

1. **Unsubscribe on unmount** - Always clean up channels
2. **Filter server-side** - Use `filter` parameter
3. **Debounce broadcasts** - For cursor/typing
4. **Limit presence** - Don't track too much data
5. **Use optimistic updates** - Update UI before server confirms

---

## RLS for Realtime

```sql
-- Users can only receive messages for their rooms
CREATE POLICY "Room members receive messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_id = messages.room_id
        AND user_id = auth.uid()
    )
  );
```

---

## Checklist

- [ ] Realtime enabled on tables
- [ ] RLS policies allow realtime access
- [ ] Channels cleaned up on unmount
- [ ] Error handling for disconnects
- [ ] Reconnection logic
- [ ] Rate limiting for broadcasts

---

## Related Skills

- **database-design**: For RLS on realtime tables
- **auth-implementation**: For authenticated subscriptions
- **web-architecture**: For state management
