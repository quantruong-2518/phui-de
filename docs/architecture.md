# Architecture

## Stack

- **Next.js 16** App Router, React 19, TypeScript strict
- **Supabase** (PostgreSQL + Auth + RLS), `@supabase/ssr` cho cookie-based session
- **Tailwind CSS** + **shadcn/ui** (radix primitives)
- **TanStack Query** cho client cache
- **Zod** cho validation cả client lẫn server
- **react-hook-form** cho form
- **sonner** cho toast

## Layer responsibilities

```
Browser ──► Middleware ──► Route Handler / Page ──► Supabase
              │                  │                      │
              │                  └─► Helper:           ├─► RLS
              │                       requireTeamAccess │
              └─► auth refresh                          └─► Trigger / RPC
```

| Layer | File pattern | Trách nhiệm |
|-------|--------------|------------|
| Middleware | `src/middleware.ts` | Refresh Supabase cookie, redirect auth gate |
| Server Component | `src/app/**/page.tsx` (no `'use client'`) | Fetch user/profile, redirect, render |
| Client Component | `src/app/**/*.tsx` với `'use client'` | Form, interactivity |
| Route Handler | `src/app/api/**/route.ts` | API JSON, validation, gọi Supabase |
| Helper | `src/lib/auth/team-access.ts` | Reusable auth + team membership check |
| Feature folder | `src/features/<name>/` | Components, hooks, types per business domain |
| Shared UI | `src/components/ui/` (shadcn), `src/components/shared/` | Reusable |

## Folder layout

```
src/
  app/
    (auth)/            ← public auth pages: /login, /register
    (protected)/       ← chỉ user đã login (middleware enforce)
      onboarding/
      teams/
        page.tsx       ← /teams (my teams)
        create/
        [id]/dashboard|matches|squad|settings
    api/
      onboarding/route.ts
      users/me/route.ts
      teams/route.ts            (list + create)
      teams/search/route.ts
      teams/[slug]/route.ts
      teams/[slug]/dashboard/route.ts
      teams/[slug]/members/route.ts
      teams/[slug]/members/[memberId]/route.ts
      teams/[slug]/players/route.ts
      teams/[slug]/players/[id]/route.ts
      teams/[slug]/matches/route.ts
      teams/[slug]/matches/[id]/route.ts
      teams/[slug]/matches/[id]/events/route.ts
      teams/[slug]/matches/[id]/events/[eventId]/route.ts
    auth/callback/route.ts      ← Supabase OAuth/email callback
    page.tsx                    ← / (server redirect tùy state)
  features/
    auth/{components,hooks,validations}
    teams/{components,hooks,types,validations}
  components/
    ui/             (shadcn)
    shared/         (FindTeamForm, etc.)
    home/, match/, navigation/, onboarding/  ← legacy, sẽ migrate
  hooks/            (use-local-storage, use-media-query)
  lib/
    api.ts          (axios client wrapper)
    auth/team-access.ts
    supabase/{client,server}.ts
  middleware.ts
  stores/use-app-store.ts (zustand)
supabase/
  migrations/
    001_initial_schema.sql
    002_user_roles_and_trigger.sql
    003_yearly_team_data.sql
    004_players_matches.sql
    005_atomic_team_create_and_rls.sql
    006_seasons_seed.sql
docs/                ← Obsidian vault
  README.md
  architecture.md
  conventions.md
  modules/*
  database/*
```

## Auth model

User login bằng Supabase Auth (email/password hoặc Google OAuth). Session lưu trong **httpOnly cookie**, refresh tự động qua middleware mỗi request.

Mỗi request:
1. `middleware.ts` chạy `supabase.auth.getUser()` để refresh cookie nếu cần
2. Server component / route handler tự gọi `supabase.auth.getUser()` lấy user hiện tại
3. Helper [[modules/teams#requireTeamAccess|requireTeamAccess]] gói cả check user + membership cho mọi endpoint cần ngữ cảnh team

3 layer auth:
- **Supabase Auth** (`auth.users`) — credentials, email verify
- **Profile** (`public.users`) — name, phone, role, onboarding_completed
- **Team membership** (`team_members`) — role trong từng team riêng biệt (`owner`/`admin`/`member`) + approval_status

## State machines

- **Onboarding**: `not_started` → `profile_saved` (PATCH /api/onboarding) → `completed` (POST /api/onboarding hoặc POST /api/teams). Xem [[modules/onboarding]].
- **Match**: `scheduled` → `live` → `finished` (hoặc `cancelled`). Trigger DB tự cộng dồn `team_seasons` khi vào `finished`. Xem [[modules/matches]].
- **Team membership approval**: `pending` → `approved` | `rejected`.

## Cross-cutting

- **Validation**: zod ở mọi boundary. Client schema = server schema khi có thể. Trả `details: parsed.error.flatten()` về client.
- **Error format**: `{ error: string, details?: any }`. Status code: 400 (validation), 401 (no auth), 403 (no permission), 404 (resource), 409 (conflict), 500 (server).
- **DB consistency**: Multi-step write → RPC postgres (transaction). Xem [[database/rpcs]].
- **Stat aggregation**: trigger DB tự bump player/team_seasons → API chỉ insert event, không tự update count.

## See also

- [[conventions]]
- [[database/schema]]
