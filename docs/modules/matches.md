# Module: Matches

## Mục đích

Lịch trận, kết quả, live scoring. Stats cá nhân (qua `match_events`) và stats đội theo mùa (qua `team_seasons`) đều được aggregate tự động bởi trigger DB.

## Bảng

- `matches` — id, team_id, season_id, opponent, field, match_date, goals_scored, goals_conceded, result (`W`/`L`/`D`), status (`scheduled`/`live`/`finished`/`cancelled`), notes, created_by
- `match_events` — id, match_id, player_id, event_type (`goal`/`assist`/`clean_sheet`/`own_goal`), minute

## State machine

```
   POST /api/teams/[slug]/matches
              │
              ▼
        ┌───────────┐    PATCH status='live'
        │ scheduled │ ───────────────────────► ┌──────┐
        └───────────┘                          │ live │
              │                                 └──────┘
              │ PATCH status='cancelled'         │
              ▼                                  │ PATCH status='finished'
        ┌────────────┐                           ▼
        │ cancelled  │                   ┌──────────┐
        └────────────┘                   │ finished │  ← trigger fires:
                                          └──────────┘    bump_team_season_stats
```

Khi `status` chuyển từ ≠`finished` sang `=finished`:
- Trigger `bump_team_season_stats` (migration 004) UPSERT `team_seasons` với delta `matches_played+1`, `wins/draws/losses+1`, `goals_scored/conceded`, `total_points` (W=3đ, D=1đ).

## Endpoints

| Method | Path | Auth | Mô tả |
|--------|------|------|------|
| GET | `/api/teams/[slug]/matches?status=&limit=` | optional | List trận, sort theo `match_date DESC` |
| POST | `/api/teams/[slug]/matches` | member | Schedule trận mới (auto attach active season) |
| GET | `/api/teams/[slug]/matches/[id]` | optional | Detail + nested events + player info |
| PATCH | `/api/teams/[slug]/matches/[id]` | member | Update score/status/etc. Auto-derive `result` khi vào finished |
| DELETE | `/api/teams/[slug]/matches/[id]` | admin | Xóa trận (cascade events) |
| POST | `/api/teams/[slug]/matches/[id]/events` | member | Ghi event live |
| DELETE | `/api/teams/[slug]/matches/[id]/events/[eventId]` | member | Undo event |

## Live scoring flow

1. Tạo match: `POST /api/teams/fc-toji/matches` với `match_date`, `opponent`, `status: 'scheduled'`
2. Khi đá: PATCH `status='live'`
3. Mỗi pha bóng → POST event:
   ```json
   POST /api/teams/fc-toji/matches/<matchId>/events
   { "player_id": "...", "event_type": "goal", "minute": 27 }
   ```
   - Trigger DB tự cộng `players.goals += 1`
   - API tự cộng `matches.goals_scored += 1` (chỉ cho `goal`/`own_goal`)
4. Khi xong: PATCH `status='finished'`
   - Nếu không gửi `result`, API tự derive từ scoreline (W/L/D)
   - Trigger DB UPSERT `team_seasons` với delta

## Auto-derive result

Khi PATCH set `status='finished'` mà không kèm `result`:

```typescript
const scored = parsed.data.goals_scored ?? cur.goals_scored ?? 0;
const conceded = parsed.data.goals_conceded ?? cur.goals_conceded ?? 0;
updates.result = scored > conceded ? 'W' : scored < conceded ? 'L' : 'D';
```

## Validation

```typescript
const createSchema = z.object({
  opponent: z.string().min(1).max(80),
  match_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  field: z.string().max(120).nullable().optional(),
  status: z.enum(['scheduled', 'live', 'finished', 'cancelled']).optional(),
  goals_scored: z.number().int().min(0).optional(),
  goals_conceded: z.number().int().min(0).optional(),
  result: z.enum(['W', 'L', 'D']).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

const eventSchema = z.object({
  player_id: z.string().uuid(),
  event_type: z.enum(['goal', 'assist', 'clean_sheet', 'own_goal']),
  minute: z.number().int().min(0).max(200).nullable().optional(),
});
```

## Invariants

1. `result` derived hợp lệ khi `status='finished'` (W/L/D)
2. `match_events.player_id` phải thuộc cùng team với match (API check trước insert)
3. `goals_scored/conceded >= 0` — clamp khi DELETE event
4. Trigger `bump_team_season_stats` chỉ fire khi vào lần đầu `finished`. Nếu PATCH lại match đã finished → KHÔNG double-count (logic check `OLD.status <> 'finished' AND NEW.status = 'finished'`).

## Failure modes

| Trường hợp | Xử lý |
|-----------|------|
| Insert event với player_id của team khác | API check → 400 |
| PATCH match từ `finished` → `scheduled` lại | Trigger không tự trừ stats. **Không support undo finished** ở MVP — cần xóa và tạo lại nếu cần. |
| DELETE event sau khi match đã finished | Trigger trừ player stats; team_seasons KHÔNG tự rollback (limitation MVP). |
| `season_id=null` (chưa có active season) | Trigger không UPSERT team_seasons → trận đó không vào leaderboard mùa nào. |

## Frontend touchpoints

- `/teams/[slug]/matches` — route đã tồn tại
- `src/components/match/{LiveMatchScoring,UpcomingMatches,MatchHistory}.tsx` — UI có sẵn, cần wire vào API

## See also

- [[players]] — `match_events.player_id` reference
- [[teams]] — `team_seasons` aggregation
- [[../database/rpcs#bump_player_stats]]
- [[../database/rpcs#bump_team_season_stats]]
- [[../database/schema#matches]]
