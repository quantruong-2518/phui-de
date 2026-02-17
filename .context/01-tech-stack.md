# Tech Stack & Conventions

## Framework

- Next.js 14.x (App Router - KHÔNG dùng Pages Router)
- React 18.x
- TypeScript (strict mode)

## Styling

- Tailwind CSS 3.x
- shadcn/ui components
- CSS Variables cho theming
- Mobile-first approach

## Database & Backend

- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage
- Row Level Security (RLS)

## State Management

- React Server Components (default)
- Client state: React hooks
- Server state: SWR hoặc TanStack Query

## Form Handling

- React Hook Form
- Zod validation
- shadcn Form components

## Code Style

- Functional components only
- Arrow functions
- async/await (không .then())
- Early returns
- Destructure props
- Named exports (không default export)

## Import Order

```typescript
// 1. External packages
import { useState } from 'react';
import { Card } from '@/components/ui/card';

// 2. Internal absolute imports
import { Button } from '@/components/ui/button';
import { usePlayers } from '@/features/players';

// 3. Types
import type { Player } from '@/types';

// 4. Relative imports (ít dùng)
import { helper } from './helper';
```

## Naming Conventions

- Components: `PascalCase` (PlayerCard.tsx)
- Hooks: `use-kebab-case` (use-players.ts)
- Utils: `kebab-case` (calculate-points.ts)
- Types files: `kebab.types.ts` (player.types.ts)
- API routes: `route.ts` (trong folder)
- Constants: `SCREAMING_SNAKE_CASE`

## Path Aliases

```typescript
@/          → root
@/components → ./components
@/features   → ./features
@/lib        → ./lib
@/types      → ./types
```

## File này dùng khi nào

- Trước khi tạo bất kỳ file code nào
- Khi có conflict về convention
