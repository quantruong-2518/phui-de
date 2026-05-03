-- Phủ Đê - Cho phép thêm thành viên không có account (guest)
-- Migration: 016_team_members_guest
-- Created: 2026-05-03
--
-- Trước: muốn vào team_members user phải có user_id (login + join request).
-- Sau: owner/admin có thể tạo trực tiếp 1 row team_members chỉ với
--      `display_name` (user_id NULL = guest). Sau này có thể link account
--      bằng cách update user_id.
--
-- Idempotent. user_id vốn đã nullable từ mig 001, nên chỉ cần thêm cột mới
-- + policy mới.

-- 1. Cột display_name cho guest
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS display_name TEXT;

COMMENT ON COLUMN public.team_members.display_name IS
  'Tên hiển thị cho member không có account (guest). Khi user_id IS NOT NULL ưu tiên users.name.';

-- 2. CHECK: mỗi row phải có ít nhất user_id hoặc display_name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'team_members_identity_chk'
  ) THEN
    ALTER TABLE public.team_members
      ADD CONSTRAINT team_members_identity_chk
      CHECK (user_id IS NOT NULL OR display_name IS NOT NULL);
  END IF;
END $$;

-- 3. RLS: owner/admin được INSERT row mới (cả guest lẫn linked).
--    Giữ policy cũ "Users can join teams" (user tự gửi join request).
DROP POLICY IF EXISTS "Owners and admins add members" ON public.team_members;
CREATE POLICY "Owners and admins add members" ON public.team_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
        AND tm.approval_status = 'approved'
    )
  );
