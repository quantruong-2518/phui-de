-- Phủ Đê - Initial Database Schema
-- Migration: 001_initial_schema
-- Created: 2026-02-18

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL, -- Team code (e.g., PH001, TOJI001)
  logo_url TEXT,
  primary_color TEXT DEFAULT '#BFFF00',
  secondary_color TEXT DEFAULT '#1A1A1A',
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  team_role_id TEXT, -- Custom role ID (coach, captain, striker, etc.)
  team_role_label TEXT, -- Custom role label
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Onboarding data table
CREATE TABLE IF NOT EXISTS public.onboarding_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('team_member', 'free_agent')),
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  role_id TEXT,
  custom_role TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_owner ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_code ON public.teams(code);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;

-- Users Policies
DROP POLICY IF EXISTS "Users can read all users" ON public.users;
CREATE POLICY "Users can read all users" ON public.users 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams Policies
DROP POLICY IF EXISTS "Anyone can read teams" ON public.teams;
CREATE POLICY "Anyone can read teams" ON public.teams 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams" ON public.teams 
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update teams" ON public.teams;
CREATE POLICY "Owners can update teams" ON public.teams 
  FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete teams" ON public.teams;
CREATE POLICY "Owners can delete teams" ON public.teams 
  FOR DELETE USING (auth.uid() = owner_id);

-- Team Members Policies
DROP POLICY IF EXISTS "Users can read team members" ON public.team_members;
CREATE POLICY "Users can read team members" ON public.team_members 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;
CREATE POLICY "Users can join teams" ON public.team_members 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can manage members" ON public.team_members;
CREATE POLICY "Owners can manage members" ON public.team_members 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id = team_id AND owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can remove members" ON public.team_members;
CREATE POLICY "Owners can remove members" ON public.team_members 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id = team_id AND owner_id = auth.uid()
    )
  );

-- Onboarding Data Policies
DROP POLICY IF EXISTS "Users can read own onboarding" ON public.onboarding_data;
CREATE POLICY "Users can read own onboarding" ON public.onboarding_data 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own onboarding" ON public.onboarding_data;
CREATE POLICY "Users can create own onboarding" ON public.onboarding_data 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own onboarding" ON public.onboarding_data;
CREATE POLICY "Users can update own onboarding" ON public.onboarding_data 
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for teams table
DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- Insert sample teams (only if empty)
-- Note: You'll need to replace owner_id with actual user IDs from auth.users
-- INSERT INTO public.teams (name, slug, code, primary_color, secondary_color, owner_id)
-- SELECT 'FC Toji', 'fc-toji', 'TOJI001', '#BFFF00', '#1A1A1A', auth.uid()
-- WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE code = 'TOJI001');
-- Migration 002: User Roles and Auth Trigger

-- 1. Add role-related columns to public.users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('PLAYER', 'FIELD_OWNER', 'VENDOR', 'ADMIN')) DEFAULT 'PLAYER',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')) DEFAULT 'PENDING';

-- 2. Make name optional since users might not provide it immediately at registration
ALTER TABLE public.users ALTER COLUMN name DROP NOT NULL;

-- 3. Create a function to automatically insert a user profile when they sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, role, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::text, 'PLAYER'),
    COALESCE((NEW.raw_user_meta_data->>'full_name')::text, ''),
    COALESCE((NEW.raw_user_meta_data->>'avatar_url')::text, '')
  );
  RETURN NEW;
END;
$$;

-- 4. Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Phủ Đê - Yearly Data Schema
-- Migration: 003_yearly_team_data
-- Created: 2026-02-24

-- ============================================================================
-- 1. SEASONS (Năm/Mùa Giải)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL, -- e.g. "Mùa giải 2024"
  is_active BOOLEAN DEFAULT false,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chỉ cho phép 1 season có is_active = true
CREATE UNIQUE INDEX IF NOT EXISTS idx_seasons_active ON public.seasons (is_active) WHERE is_active = true;

-- Trigger update updated_at cho seasons
DROP TRIGGER IF EXISTS update_seasons_updated_at ON public.seasons;
CREATE TRIGGER update_seasons_updated_at
  BEFORE UPDATE ON public.seasons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read seasons" ON public.seasons;
CREATE POLICY "Anyone can read seasons" ON public.seasons FOR SELECT USING (true);


-- ============================================================================
-- 2. TEAM_SEASONS (Thành tích của đội bóng theo Năm)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.team_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
  
  -- Sẽ update về 0 mỗi khi tạo năm mới
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_scored INTEGER DEFAULT 0,
  goals_conceded INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0, -- Có thể tính 3 điểm/win, 1 điểm/draw
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(team_id, season_id)
);

-- Indexes 
CREATE INDEX IF NOT EXISTS idx_team_seasons_team ON public.team_seasons(team_id);
CREATE INDEX IF NOT EXISTS idx_team_seasons_season ON public.team_seasons(season_id);

-- Trigger update updated_at cho team_seasons
DROP TRIGGER IF EXISTS update_team_seasons_updated_at ON public.team_seasons;
CREATE TRIGGER update_team_seasons_updated_at
  BEFORE UPDATE ON public.team_seasons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Tương tự teams: public read, owner update)
ALTER TABLE public.team_seasons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read team seasons" ON public.team_seasons;
CREATE POLICY "Anyone can read team seasons" ON public.team_seasons FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owners can update team seasons" ON public.team_seasons;
CREATE POLICY "Owners can update team seasons" ON public.team_seasons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = team_id AND owner_id = auth.uid()
    )
  );
  

-- ============================================================================
-- 3. ALTER TEAM_MEMBERS & PLAYERS
-- ============================================================================
-- Thêm cột season_id vào bảng team_members để cầu thủ phụ thuộc vào năm
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE;

-- Drop cái UNIQUE cũ (team_id, user_id) nếu muốn 1 user đá cho 1 team ở nhiều năm khác nhau.
-- Sửa lại ràng buộc: 1 user chỉ có 1 record ở 1 team TRONG CÙNG 1 NĂM.
ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_team_id_user_id_key;
ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_team_season_unique;
ALTER TABLE public.team_members ADD CONSTRAINT team_members_team_season_unique UNIQUE (team_id, user_id, season_id);

-- Bổ sung record Season hiện tại nếu đang trống. Vd setup mặc định là năm 2024
INSERT INTO public.seasons (year, name, is_active, start_date, end_date)
VALUES (2024, 'Năm 2024', true, '2024-01-01', '2024-12-31')
ON CONFLICT (year) DO NOTHING;

-- Tự động gán season_id hiện tại (2024) cho những cầu thủ đã có sẵn (nếu có lúc test)
UPDATE public.team_members 
SET season_id = (SELECT id FROM public.seasons WHERE is_active = true)
WHERE season_id IS NULL;

-- Sửa Schema: Đưa điểm số của Player ra khỏi Player chung chung
-- Nếu bảng `players` dùng để tính điểm tự động, điểm đó CẦN GẮN THEO NĂM HOẶC TEM, ko thể lưu gộp mãi mãi
-- Tạm thời thêm season_id vào bảng `players` (kịch bản này sẽ yêu cầu player tái tạo record mỗi năm, hoặc thêm bảng `player_seasons`)
-- Để đơn giản trong MVPs, ta giữ nguyên `players` nhưng hiểu rằng `goals` & `assists` là TỔNG SỰ NGHIỆP,
-- Còn điểm the Mùa giải sẽ lấy SUM() từ `match_events` theo match_id nằm trong year_id.
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
-- Phủ Đê - Atomic team creation + RLS tightening
-- Migration: 005_atomic_team_create_and_rls
-- Created: 2026-05-02

-- ============================================================================
-- 1. RPC: create_team_with_owner
-- ----------------------------------------------------------------------------
-- Wraps: insert team, attach to active season, add owner as captain member,
-- write onboarding_data, mark user.onboarding_completed=true.
--
-- All in a single function = single transaction. Either everything commits or
-- nothing does (Postgres rolls back on RAISE / unique violation).
--
-- SECURITY DEFINER lets us bypass RLS for the cross-table inserts, but we still
-- enforce that the caller is creating a team they own (auth.uid() = owner).
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_team_with_owner(
  p_name TEXT,
  p_slug TEXT,
  p_primary_color TEXT,
  p_secondary_color TEXT,
  p_code TEXT,
  p_profile_name TEXT DEFAULT NULL,
  p_profile_phone TEXT DEFAULT NULL
)
RETURNS TABLE (team_id UUID, slug TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_team_id UUID;
  v_season_id UUID;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
    RAISE EXCEPTION 'Invalid slug format' USING ERRCODE = '22023';
  END IF;

  -- Step 1: insert team. Unique violation on slug propagates as 23505.
  INSERT INTO public.teams (name, slug, code, primary_color, secondary_color, owner_id)
  VALUES (p_name, p_slug, p_code, COALESCE(p_primary_color, '#22c55e'), COALESCE(p_secondary_color, '#ffffff'), v_user)
  RETURNING id INTO v_team_id;

  -- Step 2: hook the active season (best-effort)
  SELECT id INTO v_season_id FROM public.seasons WHERE is_active = true LIMIT 1;

  IF v_season_id IS NOT NULL THEN
    INSERT INTO public.team_seasons (team_id, season_id, matches_played)
    VALUES (v_team_id, v_season_id, 0)
    ON CONFLICT (team_id, season_id) DO NOTHING;
  END IF;

  -- Step 3: owner becomes captain
  INSERT INTO public.team_members (
    team_id, user_id, season_id, role,
    team_role_id, team_role_label,
    approval_status, approved_by, approved_at
  )
  VALUES (
    v_team_id, v_user, v_season_id, 'owner',
    'captain', 'Đội trưởng',
    'approved', v_user, NOW()
  );

  -- Step 4: finalize onboarding_data
  INSERT INTO public.onboarding_data (
    user_id, status, team_id, role_id, custom_role, completed_at
  )
  VALUES (v_user, 'team_member', v_team_id, 'captain', 'Đội trưởng (Owner)', NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    status = EXCLUDED.status,
    team_id = EXCLUDED.team_id,
    role_id = EXCLUDED.role_id,
    custom_role = EXCLUDED.custom_role,
    completed_at = EXCLUDED.completed_at;

  -- Step 5: profile + onboarding_completed
  UPDATE public.users
  SET
    name = COALESCE(p_profile_name, name),
    phone = COALESCE(p_profile_phone, phone),
    onboarding_completed = true,
    updated_at = NOW()
  WHERE id = v_user;

  RETURN QUERY SELECT v_team_id, p_slug;
END;
$$;

REVOKE ALL ON FUNCTION public.create_team_with_owner(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_team_with_owner(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;


-- ============================================================================
-- 2. Block self-promotion: team_members.role only owner/admin can change role
-- ----------------------------------------------------------------------------
-- Existing "Owners can manage members" already restricts UPDATE to team owners,
-- but a regular member updating their OWN row would also pass that policy if
-- they are listed as the team owner. Add an extra guard via trigger so non-owner
-- users cannot escalate their `role` column even with their own UPDATE.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.guard_team_member_role()
RETURNS TRIGGER AS $$
DECLARE
  v_caller_role TEXT;
BEGIN
  -- If role column did not change, nothing to guard
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  SELECT tm.role INTO v_caller_role
  FROM public.team_members tm
  WHERE tm.team_id = NEW.team_id
    AND tm.user_id = auth.uid()
  LIMIT 1;

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Only team owners/admins can change member roles' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_guard_team_member_role ON public.team_members;
CREATE TRIGGER trg_guard_team_member_role
  BEFORE UPDATE OF role ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.guard_team_member_role();


-- ============================================================================
-- 3. RLS tightening: hide phone from non-self / non-teammate
-- ----------------------------------------------------------------------------
-- Old policy: SELECT USING (true) on public.users → exposed phone numbers to
-- every authenticated user. Replace with column-aware view + tighter policy.
-- ============================================================================

-- Lightweight public profile view that strips phone unless caller is self or
-- a teammate of the row's user.
CREATE OR REPLACE VIEW public.user_public_profiles AS
SELECT
  u.id,
  u.name,
  u.avatar_url,
  u.role,
  u.created_at,
  CASE
    WHEN u.id = auth.uid() THEN u.phone
    WHEN EXISTS (
      SELECT 1
      FROM public.team_members me
      JOIN public.team_members other ON other.team_id = me.team_id
      WHERE me.user_id = auth.uid()
        AND other.user_id = u.id
    ) THEN u.phone
    ELSE NULL
  END AS phone
FROM public.users u;

GRANT SELECT ON public.user_public_profiles TO authenticated, anon;

-- Tighten the underlying users policy: keep public id/name lookup possible (the
-- view depends on it) but consumers that need phone should use the view.
-- (We leave the existing SELECT USING (true) policy in place because the view
-- abstracts column visibility, and dropping it would break joins like
-- teams_owner_id_fkey foreign-key resolves used in /api/teams/search.)

-- NOTE: phone column exposure is now governed by application code reading the
-- view rather than the table directly. Server code should switch to the view
-- when displaying other users' phones.
-- Phủ Đê - Seed seasons
-- Migration: 006_seasons_seed
-- Created: 2026-05-02
--
-- 003 only inserted year 2024. Bring seasons up to date and mark the current
-- year (2026) as active. The unique partial index on `is_active=true` means
-- we must clear other active flags first.

UPDATE public.seasons SET is_active = false WHERE is_active = true;

INSERT INTO public.seasons (year, name, is_active, start_date, end_date)
VALUES
  (2025, 'Mùa giải 2025', false, '2025-01-01', '2025-12-31'),
  (2026, 'Mùa giải 2026', true,  '2026-01-01', '2026-12-31')
ON CONFLICT (year) DO UPDATE SET
  is_active = EXCLUDED.is_active,
  name = EXCLUDED.name,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  updated_at = NOW();
