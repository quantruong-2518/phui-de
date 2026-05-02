# Database Schema

Source of truth: file `supabase/migrations/*.sql`. Đọc theo thứ tự 001 → 006.

## Sơ đồ quan hệ (rút gọn)

```
auth.users ──1:1──► public.users ──1:N──► onboarding_data
                          │
                          ├─1:N──► team_members ◄─N:1── teams ──1:N──► players
                          │                                │              │
                          └─1:N──► (owner_id)──────────────┘              │
                                                                           │
                                              seasons ──1:N──► team_seasons (team, season unique)
                                                                  │
                                                                  matches ──1:N──► match_events ──N:1──► players
```

## Bảng

### users `migration 001 + 002`

| Cột | Kiểu | Note |
|-----|------|------|
| id | UUID PK | FK `auth.users(id)` ON DELETE CASCADE |
| name | TEXT | nullable (drop NOT NULL ở 002) |
| phone | TEXT | format chỉ enforce ở app |
| avatar_url | TEXT | |
| role | TEXT | CHECK `'PLAYER','FIELD_OWNER','VENDOR','ADMIN'`, default `'PLAYER'` |
| onboarding_completed | BOOLEAN | default `false` |
| verification_status | TEXT | CHECK `'PENDING','VERIFIED','REJECTED'`, default `'PENDING'` |
| created_at, updated_at | TIMESTAMPTZ | |

### teams `migration 001`

| Cột | Kiểu | Note |
|-----|------|------|
| id | UUID PK | gen_random_uuid |
| name | TEXT NOT NULL | |
| slug | TEXT UNIQUE NOT NULL | regex enforced trong RPC |
| code | TEXT UNIQUE NOT NULL | generated `<3 first letters>+<random4>` |
| logo_url | TEXT | |
| primary_color | TEXT | default `#BFFF00` |
| secondary_color | TEXT | default `#1A1A1A` |
| owner_id | UUID | FK users(id) ON DELETE CASCADE |
| created_at, updated_at | TIMESTAMPTZ | |

### team_members `migration 001 + 003`

| Cột | Kiểu | Note |
|-----|------|------|
| id | UUID PK | |
| team_id | UUID | FK teams(id) ON DELETE CASCADE |
| user_id | UUID | FK users(id) ON DELETE CASCADE |
| season_id | UUID | FK seasons(id) ON DELETE CASCADE (added 003) |
| role | TEXT | CHECK `'owner','admin','member'` |
| team_role_id | TEXT | label role tự do (`captain`, `coach`, ...) |
| team_role_label | TEXT | |
| approval_status | TEXT | CHECK `'pending','approved','rejected'`, default `'pending'` |
| requested_at, approved_at, joined_at | TIMESTAMPTZ | |
| approved_by | UUID | FK users(id) |

UNIQUE (team_id, user_id, season_id) — 003 thay đổi từ (team_id, user_id) cũ.

### onboarding_data `migration 001`

| Cột | Kiểu | Note |
|-----|------|------|
| id | UUID PK | |
| user_id | UUID UNIQUE | FK users(id) ON DELETE CASCADE |
| status | TEXT | CHECK `'team_member','free_agent'` |
| team_id | UUID | FK teams(id) ON DELETE SET NULL |
| role_id | TEXT | |
| custom_role | TEXT | |
| completed_at | TIMESTAMPTZ | |

### seasons `migration 003 + 006`

| Cột | Kiểu | Note |
|-----|------|------|
| id | UUID PK | |
| year | INTEGER UNIQUE NOT NULL | |
| name | TEXT NOT NULL | |
| is_active | BOOLEAN default false | partial UNIQUE INDEX `WHERE is_active=true` (chỉ 1 active) |
| start_date, end_date | DATE | |

Sau migration 006: 2024 + 2025 (không active) + **2026 (active)**.

### team_seasons `migration 003`

| Cột | Kiểu | Note |
|-----|------|------|
| team_id, season_id | UUID UNIQUE pair | |
| matches_played, wins, draws, losses | INTEGER default 0 | |
| goals_scored, goals_conceded, total_points | INTEGER default 0 | |

UPSERT bởi trigger `bump_team_season_stats` khi match vào `finished`.

### players `migration 004`

| Cột | Kiểu | Note |
|-----|------|------|
| id | UUID PK | |
| team_id | UUID NOT NULL | FK teams(id) ON DELETE CASCADE |
| name | TEXT NOT NULL | |
| code | TEXT | UNIQUE (team_id, code) |
| avatar_url | TEXT | |
| position | TEXT | CHECK `'GK','DF','MF','FW' OR NULL` |
| matches_played, goals, assists, clean_sheets | INTEGER NOT NULL default 0 | |
| total_points | INTEGER GENERATED ALWAYS AS (goals*3 + assists*2 + clean_sheets) STORED | computed |

### matches `migration 004`

| Cột | Kiểu | Note |
|-----|------|------|
| id | UUID PK | |
| team_id | UUID NOT NULL | FK teams ON DELETE CASCADE |
| season_id | UUID | FK seasons ON DELETE SET NULL |
| opponent | TEXT NOT NULL | |
| field | TEXT | |
| match_date | DATE NOT NULL | |
| goals_scored, goals_conceded | INTEGER NOT NULL default 0 | |
| result | TEXT | CHECK `'W','L','D' OR NULL` |
| status | TEXT NOT NULL default `'scheduled'` | CHECK `'scheduled','live','finished','cancelled'` |
| notes | TEXT | |
| created_by | UUID | FK users ON DELETE SET NULL |

### match_events `migration 004`

| Cột | Kiểu | Note |
|-----|------|------|
| id | UUID PK | |
| match_id | UUID NOT NULL | FK matches ON DELETE CASCADE |
| player_id | UUID NOT NULL | FK players ON DELETE CASCADE |
| event_type | TEXT NOT NULL | CHECK `'goal','assist','clean_sheet','own_goal'` |
| minute | INTEGER | CHECK `0 <= minute <= 200 OR NULL` |

## Indexes

| Index | Bảng | Cột | Mục đích |
|-------|------|-----|---------|
| idx_team_members_team | team_members | team_id | list members của team |
| idx_team_members_user | team_members | user_id | list teams của user |
| idx_teams_owner | teams | owner_id | |
| idx_teams_code | teams | code | |
| idx_teams_slug | teams | slug | GET /api/teams/[slug] hot path |
| idx_team_seasons_team/season | team_seasons | team_id, season_id | dashboard query |
| idx_seasons_active | seasons | is_active WHERE true | partial unique |
| idx_players_team | players | team_id | list squad |
| idx_players_points | players | team_id, total_points DESC | leaderboard |
| idx_matches_team | matches | team_id | |
| idx_matches_team_date | matches | team_id, match_date DESC | recent matches |
| idx_matches_season | matches | season_id | season filter |
| idx_match_events_match | match_events | match_id | match detail nested |
| idx_match_events_player | match_events | player_id | player history |

## See also

- [[rls]] — policies
- [[rpcs]] — functions + triggers
- [[migrations]] — thứ tự apply
