# Database Schema

## Tables

### players

```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
code            INTEGER UNIQUE
avatar_url      TEXT
position        TEXT
goals           INTEGER DEFAULT 0
assists         INTEGER DEFAULT 0
matches_played  INTEGER DEFAULT 0
goalkeeper_points DECIMAL DEFAULT 0
total_points    INTEGER GENERATED ALWAYS AS (
  (goals * 3) + (assists * 2) + goalkeeper_points::INTEGER
) STORED
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### matches

```sql
id              UUID PRIMARY KEY
opponent        TEXT NOT NULL
field           TEXT
match_date      DATE NOT NULL
goals_scored    INTEGER DEFAULT 0
goals_conceded  INTEGER DEFAULT 0
result          TEXT CHECK (result IN ('W', 'L', 'D'))
notes           TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### match_events

```sql
id              UUID PRIMARY KEY
match_id        UUID REFERENCES matches(id) ON DELETE CASCADE
player_id       UUID REFERENCES players(id) ON DELETE CASCADE
event_type      TEXT CHECK (event_type IN ('goal', 'assist', 'goalkeeper'))
points          DECIMAL DEFAULT 0
created_at      TIMESTAMPTZ DEFAULT NOW()
```

## Indexes

```sql
CREATE INDEX idx_players_points ON players(total_points DESC);
CREATE INDEX idx_matches_date ON matches(match_date DESC);
CREATE INDEX idx_events_match ON match_events(match_id);
CREATE INDEX idx_events_player ON match_events(player_id);
```

## TypeScript Types

Generated: `types/database.types.ts`

Manual: `features/[feature]/types/`

```typescript
// Từ database.types.ts
export type Player = Database['public']['Tables']['players']['Row'];

// Custom type
export interface PlayerWithStats extends Player {
  recentMatches: Match[];
  goalsByMonth: Record<string, number>;
}
```

## File này dùng khi nào

- Tạo API route query database
- Tạo hook fetch data
- Cần hiểu relationships
