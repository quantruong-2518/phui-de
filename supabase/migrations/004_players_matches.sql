-- Phủ Đê - Players, Matches, Match Events
-- Migration: 004_players_matches
-- Created: 2026-05-02
--
-- Adds the core stats tables that the spec (.context/03-database-schema.md and
-- .context/14-module-players-matches.md) defines and that /api/teams/[slug]/players
-- already references.

-- ============================================================================
-- 1. PLAYERS (cầu thủ thuộc đội)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.players (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  code            TEXT,                       -- số áo / mã cầu thủ trong đội
  avatar_url      TEXT,
  position        TEXT CHECK (position IN ('GK', 'DF', 'MF', 'FW') OR position IS NULL),
  matches_played  INTEGER NOT NULL DEFAULT 0,
  goals           INTEGER NOT NULL DEFAULT 0,
  assists         INTEGER NOT NULL DEFAULT 0,
  clean_sheets    INTEGER NOT NULL DEFAULT 0,
  -- Tổng điểm tự tính: 3đ/goal + 2đ/assist + 1đ/clean_sheet
  total_points    INTEGER GENERATED ALWAYS AS (
    (goals * 3) + (assists * 2) + clean_sheets
  ) STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Số áo phải duy nhất trong đội (nếu có)
  UNIQUE (team_id, code)
);

CREATE INDEX IF NOT EXISTS idx_players_team ON public.players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_points ON public.players(team_id, total_points DESC);

DROP TRIGGER IF EXISTS update_players_updated_at ON public.players;
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 2. MATCHES (trận đấu của đội)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  season_id       UUID REFERENCES public.seasons(id) ON DELETE SET NULL,
  opponent        TEXT NOT NULL,
  field           TEXT,
  match_date      DATE NOT NULL,
  goals_scored    INTEGER NOT NULL DEFAULT 0,
  goals_conceded  INTEGER NOT NULL DEFAULT 0,
  result          TEXT CHECK (result IN ('W', 'L', 'D') OR result IS NULL),
  status          TEXT NOT NULL DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled', 'live', 'finished', 'cancelled')),
  notes           TEXT,
  created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_team ON public.matches(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_team_date ON public.matches(team_id, match_date DESC);
CREATE INDEX IF NOT EXISTS idx_matches_season ON public.matches(season_id);

DROP TRIGGER IF EXISTS update_matches_updated_at ON public.matches;
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 3. MATCH_EVENTS (bàn thắng / kiến tạo / clean sheet)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.match_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id        UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id       UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL CHECK (event_type IN ('goal', 'assist', 'clean_sheet', 'own_goal')),
  minute          INTEGER CHECK (minute IS NULL OR (minute >= 0 AND minute <= 200)),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_events_match ON public.match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_player ON public.match_events(player_id);


-- ============================================================================
-- 4. RLS
-- ============================================================================
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

-- Players: ai cũng đọc được (public stats); chỉ owner/admin của team được mutate.
DROP POLICY IF EXISTS "Anyone can read players" ON public.players;
CREATE POLICY "Anyone can read players" ON public.players
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Team admins manage players" ON public.players;
CREATE POLICY "Team admins manage players" ON public.players
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = players.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
        AND tm.approval_status = 'approved'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = players.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
        AND tm.approval_status = 'approved'
    )
  );

-- Matches: cùng kiểu — ai cũng xem được; chỉ team admin/member tạo/sửa được trận của đội mình.
DROP POLICY IF EXISTS "Anyone can read matches" ON public.matches;
CREATE POLICY "Anyone can read matches" ON public.matches
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Team members manage matches" ON public.matches;
CREATE POLICY "Team members manage matches" ON public.matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = matches.team_id
        AND tm.user_id = auth.uid()
        AND tm.approval_status = 'approved'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = matches.team_id
        AND tm.user_id = auth.uid()
        AND tm.approval_status = 'approved'
    )
  );

-- Match events: read public; mutate chỉ team member của trận đó.
DROP POLICY IF EXISTS "Anyone can read match events" ON public.match_events;
CREATE POLICY "Anyone can read match events" ON public.match_events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Team members manage match events" ON public.match_events;
CREATE POLICY "Team members manage match events" ON public.match_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.team_members tm ON tm.team_id = m.team_id
      WHERE m.id = match_events.match_id
        AND tm.user_id = auth.uid()
        AND tm.approval_status = 'approved'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.team_members tm ON tm.team_id = m.team_id
      WHERE m.id = match_events.match_id
        AND tm.user_id = auth.uid()
        AND tm.approval_status = 'approved'
    )
  );


-- ============================================================================
-- 5. TRIGGER: tự cộng dồn stats khi insert/delete match_events
-- ============================================================================
CREATE OR REPLACE FUNCTION public.bump_player_stats()
RETURNS TRIGGER AS $$
DECLARE
  delta INT;
BEGIN
  delta := CASE WHEN TG_OP = 'INSERT' THEN 1 WHEN TG_OP = 'DELETE' THEN -1 ELSE 0 END;
  IF delta = 0 THEN
    RETURN NULL;
  END IF;

  IF (TG_OP = 'INSERT' AND NEW.event_type = 'goal')
     OR (TG_OP = 'DELETE' AND OLD.event_type = 'goal') THEN
    UPDATE public.players
    SET goals = GREATEST(0, goals + delta)
    WHERE id = COALESCE(NEW.player_id, OLD.player_id);
  ELSIF (TG_OP = 'INSERT' AND NEW.event_type = 'assist')
        OR (TG_OP = 'DELETE' AND OLD.event_type = 'assist') THEN
    UPDATE public.players
    SET assists = GREATEST(0, assists + delta)
    WHERE id = COALESCE(NEW.player_id, OLD.player_id);
  ELSIF (TG_OP = 'INSERT' AND NEW.event_type = 'clean_sheet')
        OR (TG_OP = 'DELETE' AND OLD.event_type = 'clean_sheet') THEN
    UPDATE public.players
    SET clean_sheets = GREATEST(0, clean_sheets + delta)
    WHERE id = COALESCE(NEW.player_id, OLD.player_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_match_events_stats ON public.match_events;
CREATE TRIGGER trg_match_events_stats
  AFTER INSERT OR DELETE ON public.match_events
  FOR EACH ROW EXECUTE FUNCTION public.bump_player_stats();


-- ============================================================================
-- 6. TRIGGER: tự cộng dồn team_seasons khi match.status='finished'
-- ============================================================================
CREATE OR REPLACE FUNCTION public.bump_team_season_stats()
RETURNS TRIGGER AS $$
DECLARE
  win_delta INT := 0;
  draw_delta INT := 0;
  loss_delta INT := 0;
  match_delta INT := 0;
  scored_delta INT := 0;
  conceded_delta INT := 0;
BEGIN
  -- Chỉ tính khi vừa chuyển sang finished
  IF (TG_OP = 'UPDATE' AND OLD.status <> 'finished' AND NEW.status = 'finished')
     OR (TG_OP = 'INSERT' AND NEW.status = 'finished') THEN
    match_delta := 1;
    scored_delta := COALESCE(NEW.goals_scored, 0);
    conceded_delta := COALESCE(NEW.goals_conceded, 0);
    IF NEW.result = 'W' THEN win_delta := 1;
    ELSIF NEW.result = 'D' THEN draw_delta := 1;
    ELSIF NEW.result = 'L' THEN loss_delta := 1;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  IF NEW.season_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.team_seasons (team_id, season_id, matches_played, wins, draws, losses, goals_scored, goals_conceded, total_points)
  VALUES (NEW.team_id, NEW.season_id, match_delta, win_delta, draw_delta, loss_delta, scored_delta, conceded_delta, win_delta * 3 + draw_delta)
  ON CONFLICT (team_id, season_id) DO UPDATE SET
    matches_played = team_seasons.matches_played + match_delta,
    wins = team_seasons.wins + win_delta,
    draws = team_seasons.draws + draw_delta,
    losses = team_seasons.losses + loss_delta,
    goals_scored = team_seasons.goals_scored + scored_delta,
    goals_conceded = team_seasons.goals_conceded + conceded_delta,
    total_points = team_seasons.total_points + win_delta * 3 + draw_delta,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_matches_season_stats ON public.matches;
CREATE TRIGGER trg_matches_season_stats
  AFTER INSERT OR UPDATE OF status, result, goals_scored, goals_conceded ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.bump_team_season_stats();
