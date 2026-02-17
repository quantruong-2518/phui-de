---
description: Creates a new route page in App Router
---

Steps:

1. Read context files:
   - .context/02-folder-structure.md
   - .context/04-component-patterns.md

2. Determine page location:
   - Public: app/[route]/page.tsx
   - Protected: app/(dashboard)/[route]/page.tsx

3. Create page file:
   - Server Component by default
   - "use client" only if necessary
   - Import components from @/components
   - Import hooks from @/features

4. Structure:

```typescript
   import { PlayerTable } from '@/components/players'
   import { usePlayers } from '@/features/players'

   export default function PlayersPage() {
     // Fetch data with hooks
     // Render components
     return ...
   }
```

5. Add metadata (optional):

```typescript
export const metadata = {
  title: 'Players | Phủ Đê',
  description: '...',
};
```

Example prompt: "Create /players page showing table of all players with search"
