# Conventions

## Naming

- **Files**: kebab-case (`team-access.ts`, `use-onboarding.ts`)
- **React components**: PascalCase (`TeamCreateForm.tsx`) trong feature folder
- **Hooks**: `use-<name>.ts`, named export `use<Name>()`
- **Schemas (zod)**: `<thing>Schema` (variable), `<Thing>Input` (type)
- **DB tables**: snake_case, plural (`team_members`)
- **DB columns**: snake_case (`onboarding_completed`)

## Folder rules

- 1 module = 1 folder dưới `src/features/<name>/` với `components/`, `hooks/`, `types/`, `validations/`. Không tạo folder `utils/` chung — đặt trong feature folder của nó.
- API route handler → 1 file `route.ts` per path, export `GET`/`POST`/`PATCH`/`DELETE`.
- Page server component default — chỉ thêm `'use client'` khi cần interactivity.

## Validation

```typescript
const schema = z.object({...});
const parsed = schema.safeParse(await request.json());
if (!parsed.success) {
  return NextResponse.json(
    { error: 'Invalid input', details: parsed.error.flatten() },
    { status: 400 },
  );
}
```

- Phone: `^(\+?84|0)\d{9,10}$`
- Slug: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Hex color: `^#[0-9A-Fa-f]{6}$`
- UUID: `z.string().uuid()`

## Auth check pattern

Cho mọi `/api/teams/[slug]/...` endpoint:

```typescript
import { requireTeamAccess, isTeamAccessError } from '@/lib/auth/team-access';

export async function PATCH(req, { params }) {
  const { slug } = await params;
  const ctx = await requireTeamAccess(slug, { minRole: 'admin' });
  if (isTeamAccessError(ctx)) return ctx;
  // ctx.user, ctx.team, ctx.member, ctx.supabase đã sẵn
}
```

`minRole`: `'member'` (default), `'admin'`, `'owner'`.
`allowPublic: true` cho phép guest read.

## Error format

```json
{ "error": "Slug đã được sử dụng", "details": {...} }
```

| Code | Khi nào |
|------|---------|
| 400 | Input invalid (zod fail) hoặc business rule (vd: không xóa được owner) |
| 401 | Chưa login |
| 403 | Login rồi nhưng không có quyền (không phải member, sai role) |
| 404 | Resource không tồn tại |
| 409 | Unique violation (slug, code áo trùng) |
| 500 | Server error / DB error |

## Database writes

- Single-table write → trực tiếp via Supabase JS client
- Multi-table write phải atomic → RPC postgres (`SECURITY DEFINER`). Xem [[database/rpcs]].
- Tránh `console.error` rồi tiếp tục — luôn `throw` hoặc return error response.
- Stat counter (goals/wins/...) → **không tự update** ở API. Để trigger DB lo. Xem [[database/rpcs#triggers]].

## Error handling philosophy

- Internal code trust nhau, **không validate những gì không đến từ user**
- Validate input ở 1 chỗ duy nhất — boundary (route handler hoặc form)
- Không try/catch để "phòng xa". Chỉ catch khi có handling cụ thể (vd: `error.code === '23505'` cho unique violation)

## Comments

- Mặc định KHÔNG viết comment.
- Chỉ comment khi WHY không rõ: invariant, workaround, hidden constraint.
- KHÔNG comment WHAT (`// fetch user`).

## Test

- Build smoke: `npm run build` phải pass trước khi commit.
- TypeScript strict — không dùng `any` nếu có thể avoid.

## See also

- [[architecture]]
- [[database/schema]]
