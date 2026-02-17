# Module 3 & 4: Players and Matches

## 📦 Module 3: Player Management

### 3.1 Player List

- **URL**: `/teams/[slug]/players`
- **AC**: Table (Avatar, Name, #, Pos, Goals, Assists). Search, Filter by Position. Pagination (20).
- **Endpoint**: `GET /api/teams/[slug]/players`
- **Database**: `players` (id, team_id, name, code, position, stats...).

### 3.2 Add Player

- **URL**: `/teams/[slug]/players/new`
- **AC**: Name*, Code*, Position (GK, DEF, MID, FWD). Avatar upload. "Save & Add Another".
- **Validation**: Unique code per team.

### 3.3 Player Detail

- **URL**: `/teams/[slug]/players/[id]`
- **AC**: Header info. Stats Overview (Goals, Assists, Points). Performance Chart. Recent Matches history.

### 3.4 Edit/Delete Player

- **URL**: `/teams/[slug]/players/[id]/edit`
- **AC**: Edit all except ID. Delete with confirmation (Logic: Keep match history?).

### 3.5 Leaderboard

- **URL**: `/teams/[slug]/players/leaderboard`
- **AC**: Tabs (Top Scorers, Assists, MVPs). Rankings 1-20.

---

## 📦 Module 4: Match Management

### 4.1 Match List

- **URL**: `/teams/[slug]/matches`
- **AC**: List cards (Date, Opponent, Score, Result W/L/D). Filter by Result.
- **Endpoint**: `GET /api/teams/[slug]/matches`
- **Database**: `matches`, `match_events`.

### 4.2 Record Match (Form)

- **URL**: `/teams/[slug]/matches/new`
- **AC**: Opponent*, Date*, Field. Manual Score (Goals/Conceded) -> Auto Result. Notes.
- **Endpoint**: `POST /api/teams/[slug]/matches`

### 4.3 Live Scoring

- **URL**: `/teams/[slug]/matches/[id]/live`
- **AC**:
  - Timer/Minute input.
  - Actions: Goal, Assist, GK Point.
  - Event Log (Timeline).
  - "Finish Match" -> Updates stats.
- **Offline Support**: Sync when online.

### 4.4 Match Detail

- **URL**: `/teams/[slug]/matches/[id]`
- **AC**: Final Score. Event Timeline (Goals/Assists). Player Stats in that match.

### 4.5 Edit/Delete Match

- **AC**: Edit details (not events). Delete warning (Cascade delete events).
