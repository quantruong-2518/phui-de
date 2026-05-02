# Migrations

Apply theo thứ tự sau (mỗi file 1 lần). Nếu reset DB, chạy lại tuần tự.

| File | Ngày | Tóm tắt |
|------|------|---------|
| 001_initial_schema.sql | 2026-02-18 | users, teams, team_members, onboarding_data + RLS |
| 002_user_roles_and_trigger.sql | 2026-02 | thêm role/onboarding_completed/verification_status; trigger handle_new_user |
| 003_yearly_team_data.sql | 2026-02-24 | seasons, team_seasons; thêm season_id vào team_members |
| 004_players_matches.sql | 2026-05-02 | players, matches, match_events + trigger auto stats |
| 005_atomic_team_create_and_rls.sql | 2026-05-02 | RPC create_team_with_owner, guard_team_member_role, view user_public_profiles |
| 006_seasons_seed.sql | 2026-05-02 | seed 2025 + 2026 (active) |

## Cách apply

### Local dev (Supabase CLI)

```bash
supabase db push
# hoặc
supabase db reset    # rebuild từ đầu, apply tất cả migrations
```

### Remote (Supabase Dashboard)

Dashboard → SQL Editor → paste nội dung migration → Run. Apply tuần tự.

## Quy tắc viết migration

1. **Idempotent**: dùng `IF NOT EXISTS` cho CREATE TABLE/INDEX, `DROP POLICY IF EXISTS ... CREATE POLICY` để re-apply.
2. **Forward-only**: KHÔNG sửa migration đã commit; viết migration mới.
3. **Tên file**: `<3-digit>_<snake_case>.sql`, ngày trong header comment.
4. **RLS**: ENABLE RLS ngay khi tạo bảng + ít nhất 1 policy SELECT. Bảng không policy thì query trả 0 rows.
5. **Trigger function**: dùng `CREATE OR REPLACE`, drop+recreate trigger cho idempotent.

## Migration mới — checklist

- [ ] File số tiếp theo (007, 008, ...)
- [ ] Header comment: `Migration: <name>` + `Created: <YYYY-MM-DD>`
- [ ] Idempotent (IF NOT EXISTS / DROP IF EXISTS / CREATE OR REPLACE)
- [ ] Cập nhật [[schema]] nếu thay đổi cột
- [ ] Cập nhật [[rls]] nếu thêm/sửa policy
- [ ] Cập nhật [[rpcs]] nếu thêm function/trigger
- [ ] Test apply trên DB sạch (`supabase db reset`) trước khi push remote

## See also

- [[schema]]
- [[rls]]
- [[rpcs]]
