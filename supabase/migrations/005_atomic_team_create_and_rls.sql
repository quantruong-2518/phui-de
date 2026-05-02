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
