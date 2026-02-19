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
