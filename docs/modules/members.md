# Module: Members

## Mục đích

Quản lý ai thuộc đội nào, role gì, đã được approve chưa.

## Bảng

- `team_members` — id, team_id, user_id, season_id, role (`owner`/`admin`/`member`), team_role_id (custom: `captain`/`coach`/...), team_role_label, approval_status (`pending`/`approved`/`rejected`), requested_at, approved_at, approved_by, joined_at
- UNIQUE (team_id, user_id, season_id) — 1 user 1 row trong 1 team trong 1 mùa

## Endpoints

| Method | Path | Auth | Mô tả |
|--------|------|------|------|
| GET | `/api/teams/[slug]/members?status=pending\|approved\|rejected` | member | List members theo active season |
| PATCH | `/api/teams/[slug]/members/[memberId]` | admin | Approve/reject pending, đổi role admin↔member, đổi team_role |
| DELETE | `/api/teams/[slug]/members/[memberId]` | admin or self | Remove. Owner KHÔNG xóa được. |

## Role rank

| role | quyền |
|------|------|
| `owner` | Toàn quyền. KHÔNG thể bị demote/remove qua API. |
| `admin` | Quản lý members, players, schedule trận. |
| `member` | Xem dashboard, ghi events live (khi đang đá). |

`team_role_id` riêng (`captain`, `coach`, `striker`, `goalkeeper`...) chỉ là label hiển thị, KHÔNG ảnh hưởng quyền.

## Approval flow

1. User onboarding chọn `join_existing` → POST `/api/onboarding` insert team_members với `approval_status='pending'` (nếu role.requiresApproval=true)
2. Admin/owner thấy trong `GET /api/teams/[slug]/members?status=pending`
3. PATCH với `{ approval_status: 'approved' }` → set `approved_at` + `approved_by`
4. Member được tính là active

## Validation

```typescript
const patchSchema = z.object({
  approval_status: z.enum(['approved', 'rejected']).optional(),
  role: z.enum(['admin', 'member']).optional(),
  team_role_id: z.string().min(1).optional(),
  team_role_label: z.string().min(1).optional(),
}).refine((d) => Object.keys(d).length > 0);
```

## Invariants

1. **Owner không thể bị demote/remove qua API** — route handler tự check; thêm trigger `guard_team_member_role` (migration 005) đảm bảo non-owner không tự promote `role`.
2. **Self-remove được**: user xóa chính họ khỏi đội (không phải owner) → DELETE allowed.
3. UNIQUE (team_id, user_id, season_id) — INSERT trùng → catch `23505` → UPDATE.

## Failure modes

| Trường hợp | Xử lý |
|-----------|------|
| Non-owner cố UPDATE `role` thành `'owner'` | DB trigger `guard_team_member_role` raise `42501` |
| Owner cố demote chính họ qua PATCH | API check → 400 |
| User cố DELETE owner | API check → 400 |
| 2 admin cùng approve 1 pending request | Race nhỏ — patch update idempotent vì set values |

## Frontend touchpoints

Chưa build UI riêng. Khi cần:
- `/teams/[slug]/settings` đã có route, có thể thêm tab "Members"
- Hook gợi ý: `useTeamMembers(slug, status?)`

## See also

- [[teams]] — owner row được tạo bởi RPC
- [[onboarding]] — pending member được tạo bởi join flow
- [[../database/rpcs#guard_team_member_role]]
- [[../database/rls#team_members]]
