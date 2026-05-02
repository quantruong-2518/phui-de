-- Phủ Đê - Team approval workflow
-- Migration: 009_team_approval
-- Created: 2026-05-02
--
-- Adds an approval_status flag to teams. New teams default to 'pending' and
-- are hidden from the public listing until an admin approves them. The owner
-- and platform admins can still see their own pending teams.

-- ============================================================================
-- 1. Schema
-- ============================================================================
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS approval_status TEXT
    CHECK (approval_status IN ('pending', 'approved', 'rejected'))
    DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id);

CREATE INDEX IF NOT EXISTS idx_teams_approval_status
  ON public.teams(approval_status);

-- Existing rows (seeded teams) are auto-approved so the discover list is not
-- empty after the migration runs.
UPDATE public.teams
SET approval_status = 'approved',
    approved_at = COALESCE(approved_at, created_at)
WHERE approval_status IS NULL OR approval_status = 'pending';

-- ============================================================================
-- 2. RLS: hide non-approved teams from the public listing
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can read teams" ON public.teams;
DROP POLICY IF EXISTS "Anyone can read approved teams" ON public.teams;
CREATE POLICY "Anyone can read approved teams" ON public.teams
  FOR SELECT USING (
    approval_status = 'approved'
    OR auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'ADMIN'
    )
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = teams.id AND tm.user_id = auth.uid()
    )
  );

-- Only platform admins can flip approval_status. Owners can update other
-- columns (name, colors, …) via the existing "Owners can update teams" policy.
DROP POLICY IF EXISTS "Admins can approve teams" ON public.teams;
CREATE POLICY "Admins can approve teams" ON public.teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'ADMIN'
    )
  );
