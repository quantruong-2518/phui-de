# Row Level Security (RLS)

Tất cả bảng public.* đều ENABLE RLS. Server route handler dùng anon-key client thông qua cookie session, nên RLS là defense layer cuối.

## users `migration 001 + 005`

| Action | Policy | Rule |
|--------|--------|------|
| SELECT | "Users can read all users" | `USING (true)` — id/name/avatar/role public |
| INSERT | "Users can insert own profile" | `auth.uid() = id` |
| UPDATE | "Users can update own profile" | `auth.uid() = id` |

**Bảo mật phone**: SELECT vẫn `USING (true)` để các foreign-key embedded query (`users:owner_id(name)`) vẫn work, nhưng phone lộ. Migration 005 thêm view [[#user_public_profiles]] mask phone — server code nên đọc qua view khi cần phone của user khác.

## teams `migration 001`

| Action | Policy |
|--------|--------|
| SELECT | `USING (true)` — public |
| INSERT | `auth.uid() = owner_id` |
| UPDATE | `auth.uid() = owner_id` |
| DELETE | `auth.uid() = owner_id` |

## team_members `migration 001 + 005`

| Action | Policy | Note |
|--------|--------|------|
| SELECT | `USING (true)` | |
| INSERT | `auth.uid() = user_id` | User chỉ insert row của chính họ |
| UPDATE | EXISTS (teams.owner_id = auth.uid()) | Owner manage members |
| DELETE | EXISTS (teams.owner_id = auth.uid()) | Owner remove |

**Trigger guard `guard_team_member_role` (migration 005)**: BEFORE UPDATE OF role — nếu caller không phải owner/admin của team, raise `42501`. Chặn user tự promote thành `'owner'` qua RLS UPDATE policy.

## onboarding_data `migration 001`

| Action | Policy |
|--------|--------|
| SELECT | `auth.uid() = user_id` — chỉ chính chủ |
| INSERT | `auth.uid() = user_id` |
| UPDATE | `auth.uid() = user_id` |

## seasons `migration 003`

| Action | Policy |
|--------|--------|
| SELECT | `USING (true)` |

INSERT/UPDATE chỉ qua migration hoặc role service. App không write seasons.

## team_seasons `migration 003`

| Action | Policy |
|--------|--------|
| SELECT | `USING (true)` |
| UPDATE | EXISTS (teams.owner_id = auth.uid()) |

INSERT từ trigger DB (`SECURITY DEFINER`) bypass RLS.

## players `migration 004`

| Action | Policy |
|--------|--------|
| SELECT | `USING (true)` — public stats |
| ALL (INSERT/UPDATE/DELETE) | `EXISTS (team_members WHERE user_id = auth.uid() AND role IN ('owner','admin') AND approval_status='approved')` |

## matches `migration 004`

| Action | Policy |
|--------|--------|
| SELECT | `USING (true)` |
| ALL | `EXISTS (team_members WHERE user_id = auth.uid() AND approval_status='approved')` — bất kỳ approved member nào của team đều quản lý match được |

## match_events `migration 004`

| Action | Policy |
|--------|--------|
| SELECT | `USING (true)` |
| ALL | EXISTS (matches JOIN team_members WHERE user_id=auth.uid() AND approved) |

## user_public_profiles `migration 005` (VIEW)

```sql
CREATE VIEW user_public_profiles AS
SELECT u.id, u.name, u.avatar_url, u.role, u.created_at,
  CASE
    WHEN u.id = auth.uid() THEN u.phone
    WHEN EXISTS (
      SELECT 1 FROM team_members me
      JOIN team_members other ON other.team_id = me.team_id
      WHERE me.user_id = auth.uid() AND other.user_id = u.id
    ) THEN u.phone
    ELSE NULL
  END AS phone
FROM users u;
```

Dùng khi cần render phone của user khác (vd: list members hiển thị SĐT). Cùng team thấy nhau, ngoài team → null.

## Bảng quyền nhanh

| Bảng | Public read? | Self-write? | Cross-user write? |
|------|------|-----|---------|
| users | id/name/avatar/role | self only | none |
| teams | yes | owner only | — |
| team_members | yes | self insert | owner UPDATE/DELETE + role guard trigger |
| onboarding_data | self only | self only | — |
| seasons | yes | — (migration only) | — |
| team_seasons | yes | owner UPDATE | trigger writes |
| players | yes | — | admin/owner only |
| matches | yes | — | any approved member |
| match_events | yes | — | any approved member |

## See also

- [[rpcs]] — SECURITY DEFINER functions bypass RLS có chủ đích
- [[schema]]
