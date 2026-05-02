# Module: Teams

## Mục đích

CRUD đội bóng. Mỗi user có thể tham gia nhiều đội (qua `team_members`). User tạo đội tự động trở thành `owner` + `captain`.

## Bảng

- `teams` — id, name, slug (unique), code (unique), logo_url, primary_color, secondary_color, owner_id
- `team_seasons` — stats theo mùa (matches_played, wins, draws, losses, goals_*, total_points)

## Endpoints

| Method | Path | Auth | Mô tả |
|--------|------|------|------|
| GET | `/api/teams?scope=mine\|all&search=` | required | List. `scope=mine` (default) lọc theo team_members; `scope=all` xem hết |
| POST | `/api/teams` | required | Atomic create (xem dưới) |
| GET | `/api/teams/search?q=&page=` | optional | Public search, paginate 5/page |
| GET | `/api/teams/[slug]` | optional | Detail, kèm member_count |
| PATCH | `/api/teams/[slug]` | owner | Update name/slug/colors/logo |
| GET | `/api/teams/[slug]/dashboard` | member | Stats + recent matches + top scorers |

## Atomic create

POST `/api/teams` không insert tuần tự nữa. Nó gọi RPC postgres `create_team_with_owner` (migration 005):

```sql
SELECT * FROM create_team_with_owner(
  p_name => 'FC Toji',
  p_slug => 'fc-toji',
  p_primary_color => '#22c55e',
  p_secondary_color => '#ffffff',
  p_code => 'FCTABCD',
  p_profile_name => 'Quan Truong',  -- optional, dùng khi đến từ onboarding
  p_profile_phone => '0901234567'   -- optional
);
```

RPC làm 5 thao tác trong **1 transaction**:
1. INSERT teams
2. INSERT team_seasons (nếu có active season)
3. INSERT team_members (owner+captain, approved)
4. UPSERT onboarding_data (status=team_member)
5. UPDATE users SET onboarding_completed=true, name=COALESCE(...), phone=COALESCE(...)

Nếu bất kỳ bước nào fail → toàn bộ rollback. Slug duplicate trả error code `23505` → API trả 409.

## Validation

```typescript
const createTeamSchema = z.object({
  name: z.string().trim().min(3).max(50),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(3).max(40),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  profile: z.object({
    name: z.string().min(2).max(80),
    phone: z.string().regex(phoneRegex),
  }).optional(),
});
```

Slug regex cũng được enforce ở DB level trong RPC.

## Invariants

- `teams.slug` UNIQUE — DB enforced
- `teams.code` UNIQUE — generated bởi `generateTeamCode(name)`
- Mỗi team luôn có ít nhất 1 row trong `team_members` với `role='owner'` (atomic create đảm bảo)
- `team_members.role='owner'` row không thể bị xóa qua API (xem [[members]])

## requireTeamAccess

Helper `src/lib/auth/team-access.ts`:

```typescript
const ctx = await requireTeamAccess(slug, { minRole: 'admin' });
if (isTeamAccessError(ctx)) return ctx;
// ctx.user, ctx.team, ctx.member, ctx.supabase
```

Options:
- `minRole`: `'member'` (default) | `'admin'` | `'owner'`
- `allowPublic`: cho phép không login đọc

## Failure modes

| Trường hợp | Xử lý |
|-----------|------|
| Slug duplicate khi tạo team | RPC raise `23505` → API 409 với message tiếng Việt |
| Slug fail regex | RPC raise `22023` → API throw 500 (zod đã chặn ở client) |
| User edit slug → trùng team khác | PATCH trả 409 |
| User không phải owner cố gắng PATCH | `requireTeamAccess(minRole: 'owner')` trả 403 |
| `seasons` không có active row | RPC vẫn work; `team_seasons` chỉ insert nếu có season |

## Frontend touchpoints

- `src/app/(protected)/teams/page.tsx` — list "đội của tôi"
- `src/app/(protected)/teams/create/page.tsx` + `client.tsx` — form tạo đội
- `src/app/(protected)/teams/[id]/dashboard/page.tsx` — server component fetch dashboard
- `src/features/teams/components/TeamCard.tsx`
- `src/features/teams/hooks/use-teams.ts`
- `src/features/teams/types/team.types.ts`

## See also

- [[onboarding]] — flow "create_new" redirect tới `/teams/create`
- [[members]] — `team_members` row của owner do RPC tạo
- [[../database/rpcs#create_team_with_owner]]
- [[../database/rls#teams]]
