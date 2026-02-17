#!/bin/bash

mkdir -p .context

cat > .context/00-project-overview.md << 'EOF'
# PHỦ ĐÊ - Project Overview

## Mục đích
All-in-one platform cho bóng đá phủi: quản lý đội, đặt sân, ăn uống, mua sắm

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (PostgreSQL)

## Core Features
1. **Quản lý đội bóng & Thống kê**
   - CRUD cầu thủ
   - CRUD trận đấu
   - Stats & leaderboard
   - Live scoring

2. **Đặt sân**
   - Tìm sân gần nhất
   - Booking calendar
   - Thanh toán online

3. **Ăn uống**
   - Tìm quán quanh sân
   - Order & ship đến sân

4. **Mua sắm**
   - Shop đồ bóng đá
   - Ship tận sân

## File này dùng khi nào
- Bắt đầu session coding mới
- Agent cần hiểu big picture
EOF

cat > .context/01-tech-stack.md << 'EOF'
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
import { useState } from 'react'
import { Card } from '@/components/ui/card'

// 2. Internal absolute imports
import { Button } from '@/components/ui/button'
import { usePlayers } from '@/features/players'

// 3. Types
import type { Player } from '@/types'

// 4. Relative imports (ít dùng)
import { helper } from './helper'
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
EOF

cat > .context/02-folder-structure.md << 'EOF'
# Folder Structure

## Quy tắc tổ chức

### 1. Feature-based (KHÔNG type-based)
✅ ĐÚNG:
features/players/
├── hooks/
├── api/
└── types/

❌ SAI:
hooks/usePlayer.ts
api/players.ts
types/player.ts

### 2. Co-location
Những thứ liên quan gần nhau → cùng folder

### 3. Separation of Concerns
components/     → UI only, nhận props
features/       → Business logic, API calls
lib/            → Core utilities, config

## Structure chi tiết
```
app/
├── (dashboard)/           # Route group
│   ├── layout.tsx        # Shared layout
│   ├── page.tsx          # /dashboard
│   ├── players/
│   │   ├── page.tsx      # /players (list)
│   │   ├── [id]/
│   │   │   └── page.tsx  # /players/[id] (detail)
│   │   └── new/
│   │       └── page.tsx  # /players/new (create)
│   └── matches/
│       └── ...
├── api/
│   ├── players/
│   │   ├── route.ts          # GET, POST
│   │   └── [id]/
│   │       └── route.ts      # GET, PUT, DELETE
│   └── ...
└── ...

components/
├── ui/                    # shadcn (auto-generated)
├── layout/                # App-wide layout
├── shared/                # Reusable generic
└── [feature]/             # Feature-specific
    ├── FeatureCard.tsx
    ├── FeatureTable.tsx
    └── index.ts           # Barrel export

features/
└── [feature]/
    ├── index.ts           # Barrel export
    ├── hooks/
    │   └── use-*.ts
    ├── api/
    │   └── *-api.ts
    ├── types/
    │   └── *.types.ts
    ├── utils/
    │   └── *.ts
    └── validations/
        └── *-schema.ts

lib/
├── supabase/
│   ├── client.ts          # Browser client
│   └── server.ts          # Server client
├── utils/
└── constants/

types/
├── database.types.ts      # Supabase generated
└── common.types.ts        # Shared types
```

## Barrel Exports (index.ts)

Mỗi folder components/[feature] và features/[feature] phải có:
```typescript
// components/players/index.ts
export { PlayerCard } from './PlayerCard'
export { PlayerTable } from './PlayerTable'

// features/players/index.ts
export * from './hooks/use-players'
export * from './types/player.types'
```

## Khi nào tạo file mới?

### Component
- Nếu UI component → `components/[feature]/`
- Nếu layout component → `components/layout/`
- Nếu reusable generic → `components/shared/`

### Logic
- Hook → `features/[feature]/hooks/`
- API call → `features/[feature]/api/`
- Business logic → `features/[feature]/utils/`
- Type → `features/[feature]/types/`
- Validation → `features/[feature]/validations/`

### Route
- Page → `app/(group)/[route]/page.tsx`
- API → `app/api/[endpoint]/route.ts`

## File này dùng khi nào
- Trước khi tạo file/folder mới
- Không chắc nên đặt code ở đâu
EOF

cat > .context/03-database-schema.md << 'EOF'
# Database Schema

## Tables

### players
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
code            INTEGER UNIQUE
avatar_url      TEXT
position        TEXT
goals           INTEGER DEFAULT 0
assists         INTEGER DEFAULT 0
matches_played  INTEGER DEFAULT 0
goalkeeper_points DECIMAL DEFAULT 0
total_points    INTEGER GENERATED ALWAYS AS (
  (goals * 3) + (assists * 2) + goalkeeper_points::INTEGER
) STORED
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### matches
```sql
id              UUID PRIMARY KEY
opponent        TEXT NOT NULL
field           TEXT
match_date      DATE NOT NULL
goals_scored    INTEGER DEFAULT 0
goals_conceded  INTEGER DEFAULT 0
result          TEXT CHECK (result IN ('W', 'L', 'D'))
notes           TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### match_events
```sql
id              UUID PRIMARY KEY
match_id        UUID REFERENCES matches(id) ON DELETE CASCADE
player_id       UUID REFERENCES players(id) ON DELETE CASCADE
event_type      TEXT CHECK (event_type IN ('goal', 'assist', 'goalkeeper'))
points          DECIMAL DEFAULT 0
created_at      TIMESTAMPTZ DEFAULT NOW()
```

## Indexes
```sql
CREATE INDEX idx_players_points ON players(total_points DESC);
CREATE INDEX idx_matches_date ON matches(match_date DESC);
CREATE INDEX idx_events_match ON match_events(match_id);
CREATE INDEX idx_events_player ON match_events(player_id);
```

## TypeScript Types

Generated: `types/database.types.ts`

Manual: `features/[feature]/types/`
```typescript
// Từ database.types.ts
export type Player = Database['public']['Tables']['players']['Row']

// Custom type
export interface PlayerWithStats extends Player {
  recentMatches: Match[]
  goalsByMonth: Record<string, number>
}
```

## File này dùng khi nào
- Tạo API route query database
- Tạo hook fetch data
- Cần hiểu relationships
EOF

echo "✅ Context files created!"


