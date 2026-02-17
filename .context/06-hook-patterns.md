# Hook Patterns

## Template: Data Fetching Hook

```typescript
// features/players/hooks/use-players.ts
import useSWR from 'swr';
import type { Player } from '../types/player.types';

interface UsePlayersOptions {
  page?: number;
  limit?: number;
}

export function usePlayers(options: UsePlayersOptions = {}) {
  const { page = 1, limit = 10 } = options;

  const { data, error, mutate } = useSWR(
    `/api/players?page=${page}&limit=${limit}`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch players');
      return res.json();
    },
  );

  return {
    players: data?.data,
    total: data?.total,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
```

## Template: Mutation Hook

```typescript
// features/players/hooks/use-create-player.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { CreatePlayerInput } from '../types/player.types';

export function useCreatePlayer() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const createPlayer = async (input: CreatePlayerInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) throw new Error('Failed to create player');

      const { data } = await res.json();

      toast.success('Player created successfully');
      router.push(`/players/${data.id}`);

      return data;
    } catch (error) {
      toast.error('Failed to create player');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPlayer, isLoading };
}
```

## Rules

1. **Return Object (không array)**

```typescript
// ✅ ĐÚNG
return { data, isLoading, error };

// ❌ SAI
return [data, isLoading, error];
```

2. **Naming**
   - Fetch: `use[Entity]s` (usePlayers)
   - Single: `use[Entity]` (usePlayer)
   - Mutation: `use[Action][Entity]` (useCreatePlayer)

3. **Loading & Error States**
   - Luôn expose isLoading, isError
   - Consistent naming

4. **Toast Notifications**
   - Success: toast.success()
   - Error: toast.error()

## Checklist tạo hook

- [ ] Return object (không array)
- [ ] TypeScript types cho params & return
- [ ] Loading & error states
- [ ] Toast notifications (mutations)
- [ ] Error handling
- [ ] Export từ index.ts

## File này dùng khi nào

- Tạo hook mới
- Cần fetch data
- Cần mutation logic
