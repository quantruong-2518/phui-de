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

components/ → UI only, nhận props
features/ → Business logic, API calls
lib/ → Core utilities, config

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
export { PlayerCard } from './PlayerCard';
export { PlayerTable } from './PlayerTable';

// features/players/index.ts
export * from './hooks/use-players';
export * from './types/player.types';
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
