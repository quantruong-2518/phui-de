# Module: Players

## Mục đích

Squad của đội. Mỗi đội có danh sách cầu thủ riêng. Stats cá nhân (goals, assists, clean_sheets) cộng dồn từ `match_events` qua trigger DB.

**Lưu ý**: `players` không liên kết với `auth.users` — đây là cầu thủ trong squad đội, KHÔNG nhất thiết là user của hệ thống. Một cầu thủ có thể chỉ tồn tại trong squad, không cần register tài khoản.

## Bảng

- `players` — id, team_id, name, code (số áo, unique trong team), position (`GK`/`DF`/`MF`/`FW`), avatar_url, matches_played, goals, assists, clean_sheets, total_points (computed: `goals*3 + assists*2 + clean_sheets`)

## Endpoints

| Method | Path | Auth | Mô tả |
|--------|------|------|------|
| GET | `/api/teams/[slug]/players` | optional | List squad, sort theo total_points DESC |
| POST | `/api/teams/[slug]/players` | admin | Add player |
| GET | `/api/teams/[slug]/players/[id]` | optional | Detail |
| PATCH | `/api/teams/[slug]/players/[id]` | admin | Update name/code/position/avatar |
| DELETE | `/api/teams/[slug]/players/[id]` | admin | Xóa (cascade match_events) |

## Validation

```typescript
const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  code: z.string().trim().min(1).max(10).optional(),
  position: z.enum(['GK', 'DF', 'MF', 'FW']).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
});
```

## Stats aggregation

**Không** update `goals`/`assists`/`clean_sheets` trực tiếp qua API. Trigger DB `bump_player_stats` (migration 004) tự cộng dồn:

```sql
INSERT INTO match_events (match_id, player_id, event_type) VALUES (..., ..., 'goal');
-- Trigger fires: UPDATE players SET goals = goals + 1 WHERE id = player_id;
```

DELETE event → trigger trừ ngược lại (clamped >= 0).

`total_points` là cột `GENERATED ALWAYS AS (goals*3 + assists*2 + clean_sheets) STORED` — không thể UPDATE, tự tính từ 3 cột kia.

## Invariants

- UNIQUE (team_id, code) — số áo unique trong đội (nếu có)
- `position` ∈ `{GK, DF, MF, FW, NULL}` — DB CHECK
- Counter columns >= 0 — trigger clamp với `GREATEST(0, ...)`

## Failure modes

| Trường hợp | Xử lý |
|-----------|------|
| Số áo trùng | DB raise `23505` → API 409 |
| Position invalid | Zod chặn ở API; nếu lọt → DB CHECK reject |
| Player bị xóa giữa lúc match đang live | match_events cascade delete; trigger trừ stats về 0 |

## Frontend touchpoints

- `/teams/[slug]/squad` — route đã tồn tại, page chưa hoàn chỉnh
- Hook gợi ý: `useTeamPlayers(slug)`, `useCreatePlayer(slug)`

## See also

- [[matches]] — `match_events` liên kết player với trận
- [[../database/rpcs#bump_player_stats]]
- [[../database/schema#players]]
