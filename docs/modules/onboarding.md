# Module: Onboarding

## Mục đích

Sau khi user đăng ký xong, dẫn họ qua các bước:
1. Nhập **profile** (name, phone)
2. Chọn **đội**: join sẵn / tạo mới / cầu thủ tự do

Cuối flow set `users.onboarding_completed=true` → user vào được phần chính của app.

## Bảng

- `users` — name, phone, onboarding_completed
- `onboarding_data` — log status (`team_member` / `free_agent`), team_id, role_id
- `team_members` — nếu join existing team thì insert pending member

## State machine

```
not_started ──(PATCH /api/onboarding)──► profile_saved
                                              │
                          ┌───────────────────┼───────────────────┐
                          ▼                   ▼                   ▼
                 status=team_member   status=free_agent   create_new
                 + insert team_members                    │
                          │                   │            ▼
                          └─POST /api/onboarding┘   POST /api/teams
                                  │                       │
                                  ▼                       ▼
                          completed (onboarding_completed=true)
```

`profile_saved` không lưu state riêng — chỉ là client step 2 sau khi PATCH.

## Endpoints

| Method | Path | Mô tả |
|--------|------|------|
| GET | `/api/onboarding` | Đọc onboarding_data + team đã chọn (cho returning user) |
| PATCH | `/api/onboarding` | Update name + phone (step 1). KHÔNG flip `onboarding_completed`. |
| POST | `/api/onboarding` | Finalize cho join_existing / free_agent. Insert onboarding_data + (optionally) team_members. Flip `onboarding_completed=true` LAST. |

Path tạo đội mới: client lưu profile vào `sessionStorage`, redirect `/teams/create` → POST `/api/teams` (xem [[teams#atomic-create]]) finalize cùng lúc tạo team + flip onboarding_completed.

## Invariants

1. `users.onboarding_completed=true` chỉ set sau khi `onboarding_data` (và `team_members` nếu joining) đã write thành công.
2. `onboarding_data.status ∈ {'team_member','free_agent'}` — check constraint DB. Client không được gửi status khác.
3. Status `team_member` bắt buộc có `team_id` (zod refine).

## Validation

```typescript
// src/app/api/onboarding/route.ts
const onboardingSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().regex(/^(\+?84|0)\d{9,10}$/),
  status: z.enum(['team_member', 'free_agent']),
  team: z.object({ id: z.string().uuid() }).optional(),
  role: z.object({ id: z.string(), label: z.string(), requiresApproval: z.boolean().optional() }),
}).refine((d) => d.status !== 'team_member' || !!d.team?.id);
```

## Failure modes

| Trường hợp | Xử lý |
|-----------|------|
| User reload trang giữa step 2 | `savedProfile` mất nếu không còn ở step 2. Server-side `users.name/phone` đã save từ step 1 → onboarding page reload sẽ pre-fill. |
| `team_members` insert duplicate (user re-join) | Catch error code `23505` → UPDATE thay vì INSERT. |
| `seasons` table chưa migrate hoặc không có active season | `season_id = null`. `team_members.season_id` cũng null. Sau khi season mới active, có thể migrate sau. |

## Frontend touchpoints

- `src/app/(protected)/onboarding/page.tsx` — server, redirect nếu đã onboarded
- `src/app/(protected)/onboarding/client.tsx` — 2-step form
- `src/components/shared/FindTeamForm.tsx` — search team trong step 2

## See also

- [[auth]] — đứng trước onboarding
- [[teams]] — endpoint POST `/api/teams` cũng finalize onboarding cho path "create_new"
- [[members]] — `team_members` rows được tạo bởi onboarding
