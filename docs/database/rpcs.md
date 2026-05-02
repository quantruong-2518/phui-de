# RPCs & Triggers

Postgres stored functions, dùng để gói transaction hoặc auto-aggregate stats.

## Functions

### create_team_with_owner `migration 005`

Atomic team creation. SECURITY DEFINER + GRANT EXECUTE TO authenticated.

**Params:**
- `p_name TEXT` — team name (3-50)
- `p_slug TEXT` — slug (regex `^[a-z0-9]+(-[a-z0-9]+)*$`, raise `22023` nếu sai)
- `p_primary_color TEXT` (nullable, default `#22c55e`)
- `p_secondary_color TEXT` (nullable, default `#ffffff`)
- `p_code TEXT` — generated bởi API
- `p_profile_name TEXT` (nullable) — set users.name nếu cung cấp
- `p_profile_phone TEXT` (nullable) — set users.phone nếu cung cấp

**Trả về:** `TABLE(team_id UUID, slug TEXT)`

**Việc làm trong 1 transaction:**
1. Validate `auth.uid()` not null (raise `42501` nếu chưa login)
2. Validate slug regex
3. INSERT teams (owner_id = auth.uid())
4. INSERT team_seasons với active season (nếu có)
5. INSERT team_members (role=`owner`, team_role=`captain`, approved)
6. UPSERT onboarding_data (status=`team_member`)
7. UPDATE users SET onboarding_completed=true + name/phone nếu cung cấp

Nếu bất kỳ step nào fail → toàn bộ rollback.

**Error codes:**
- `42501` — chưa authenticate
- `22023` — slug fail regex
- `23505` — slug đã tồn tại

**Gọi từ JS:**
```typescript
const { data, error } = await supabase.rpc('create_team_with_owner', {
  p_name, p_slug, p_primary_color, p_secondary_color, p_code,
  p_profile_name, p_profile_phone,
}).single();
```

---

### handle_new_user `migration 002 → 008 (latest)`

AFTER INSERT trigger trên `auth.users`. Tự tạo row tương ứng trong `public.users`.

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

Latest version (migration 008) ghi:
- `role` ← `raw_user_meta_data.role` (default `'PLAYER'`)
- `name` ← `raw_user_meta_data.full_name` (rỗng nếu không có)
- `phone` ← `NEW.phone` (real phone auth) **HOẶC** `raw_user_meta_data.phone` (synthetic email token approach hiện tại)
- `avatar_url` ← `raw_user_meta_data.avatar_url`

App hiện tại dùng synthetic email → register code truyền phone qua `options.data.phone` → trigger đọc từ `raw_user_meta_data.phone`. Xem [[../modules/auth#implementation-synthetic-email-token]].

---

### update_updated_at_column `migration 001`

BEFORE UPDATE trigger function. Set `NEW.updated_at = NOW()`. Attached to: `users`, `teams`, `seasons`, `team_seasons`, `players`, `matches`.

---

### guard_team_member_role `migration 005`

BEFORE UPDATE OF role trên `team_members`. Chặn non-owner/admin update column `role`. SECURITY DEFINER để có thể đọc `team_members` của caller bypass RLS.

```sql
IF OLD.role IS DISTINCT FROM NEW.role THEN
  caller_role := (SELECT role FROM team_members WHERE team_id=NEW.team_id AND user_id=auth.uid());
  IF caller_role NOT IN ('owner','admin') THEN
    RAISE EXCEPTION '...' USING ERRCODE = '42501';
  END IF;
END IF;
```

---

### bump_player_stats `migration 004`

AFTER INSERT/DELETE trên `match_events`. Tự cộng dồn `players.goals/assists/clean_sheets`.

```
INSERT match_events (event_type='goal') → UPDATE players SET goals = goals + 1
DELETE match_events (event_type='goal') → UPDATE players SET goals = GREATEST(0, goals - 1)
```

`event_type='own_goal'` không bump player stats (chỉ tracker, scoreline tự bump trong API).

---

### bump_team_season_stats `migration 004`

AFTER INSERT/UPDATE OF status, result, goals_*, conceded_* trên `matches`.

Fire khi:
- INSERT row với `status='finished'`
- UPDATE từ `status ≠ 'finished'` sang `status='finished'`

UPSERT `team_seasons` với delta:
- `matches_played + 1`
- `wins/draws/losses + 1` (theo `result`)
- `goals_scored + match.goals_scored`
- `goals_conceded + match.goals_conceded`
- `total_points + (3 nếu W, 1 nếu D, 0 nếu L)`

**Limitation**: Không tự rollback khi PATCH match từ `finished` → `scheduled`. MVP coi finished là 1-way.

---

## Tóm tắt triggers

| Trigger | Bảng | Thời điểm | Function |
|---------|------|-----------|----------|
| on_auth_user_created | auth.users | AFTER INSERT | handle_new_user |
| update_users_updated_at | users | BEFORE UPDATE | update_updated_at_column |
| update_teams_updated_at | teams | BEFORE UPDATE | update_updated_at_column |
| update_seasons_updated_at | seasons | BEFORE UPDATE | update_updated_at_column |
| update_team_seasons_updated_at | team_seasons | BEFORE UPDATE | update_updated_at_column |
| update_players_updated_at | players | BEFORE UPDATE | update_updated_at_column |
| update_matches_updated_at | matches | BEFORE UPDATE | update_updated_at_column |
| trg_guard_team_member_role | team_members | BEFORE UPDATE OF role | guard_team_member_role |
| trg_match_events_stats | match_events | AFTER INSERT/DELETE | bump_player_stats |
| trg_matches_season_stats | matches | AFTER INSERT/UPDATE | bump_team_season_stats |

## See also

- [[schema]]
- [[rls]]
- [[../modules/teams#atomic-create]]
- [[../modules/matches#state-machine]]
