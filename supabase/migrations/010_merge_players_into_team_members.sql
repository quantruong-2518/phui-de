-- Phủ Đê - Merge `players` vào `team_members`
-- Migration: 010_merge_players_into_team_members
-- Created: 2026-05-02
--
-- Trước: 3 bảng (users, team_members, players) — players tách rời, không link
-- với account đăng nhập.
--
-- Sau: chỉ users + team_members. team_members đóng vai trò junction giữa user
-- và team, đồng thời chứa cấu hình của user trong đội (số áo, vị trí, stats,
-- trạng thái hoạt động). Mọi cầu thủ phải là user đã đăng ký.
--
-- DATA: drop players + match_events hiện tại (chấp nhận theo MVP). Nếu cần
-- giữ lại stats trước khi chạy migration, export ra trước.

-- ============================================================================
-- 1. team_members: thêm cột config & stats
-- ============================================================================
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS jersey_code   TEXT,
  ADD COLUMN IF NOT EXISTS position      TEXT
    CHECK (position IN ('GK', 'DF', 'MF', 'FW') OR position IS NULL),
  ADD COLUMN IF NOT EXISTS matches_played INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS goals          INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS assists        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clean_sheets   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active      BOOLEAN NOT NULL DEFAULT true;

-- Total points (cộng dồn) — cùng công thức cũ ở players.
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS total_points INTEGER
    GENERATED ALWAYS AS ((goals * 3) + (assists * 2) + clean_sheets) STORED;

-- Số áo unique trong cùng team+season (NULL không bị ràng buộc).
DROP INDEX IF EXISTS idx_team_members_jersey_unique;
CREATE UNIQUE INDEX idx_team_members_jersey_unique
  ON public.team_members (team_id, season_id, jersey_code)
  WHERE jersey_code IS NOT NULL AND jersey_code <> '';

-- Lookup nhanh cho leaderboard
CREATE INDEX IF NOT EXISTS idx_team_members_points
  ON public.team_members (team_id, total_points DESC)
  WHERE is_active = true;

-- ============================================================================
-- 2. match_events: chuyển FK từ players → team_members
-- ============================================================================
-- Truncate trước (data hiện tại sẽ mất — đã thống nhất MVP).
TRUNCATE TABLE public.match_events;

ALTER TABLE public.match_events
  DROP COLUMN IF EXISTS player_id;

ALTER TABLE public.match_events
  ADD COLUMN team_member_id UUID NOT NULL
    REFERENCES public.team_members(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_match_events_team_member
  ON public.match_events(team_member_id);

-- ============================================================================
-- 3. Trigger: cộng dồn stats trên team_members khi insert/delete match_events
-- ============================================================================
DROP TRIGGER IF EXISTS trg_match_events_stats ON public.match_events;
DROP FUNCTION IF EXISTS public.bump_player_stats();

CREATE OR REPLACE FUNCTION public.bump_team_member_stats()
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
    UPDATE public.team_members
    SET goals = GREATEST(0, goals + delta)
    WHERE id = COALESCE(NEW.team_member_id, OLD.team_member_id);
  ELSIF (TG_OP = 'INSERT' AND NEW.event_type = 'assist')
        OR (TG_OP = 'DELETE' AND OLD.event_type = 'assist') THEN
    UPDATE public.team_members
    SET assists = GREATEST(0, assists + delta)
    WHERE id = COALESCE(NEW.team_member_id, OLD.team_member_id);
  ELSIF (TG_OP = 'INSERT' AND NEW.event_type = 'clean_sheet')
        OR (TG_OP = 'DELETE' AND OLD.event_type = 'clean_sheet') THEN
    UPDATE public.team_members
    SET clean_sheets = GREATEST(0, clean_sheets + delta)
    WHERE id = COALESCE(NEW.team_member_id, OLD.team_member_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_match_events_stats
  AFTER INSERT OR DELETE ON public.match_events
  FOR EACH ROW EXECUTE FUNCTION public.bump_team_member_stats();

-- ============================================================================
-- 4. Drop bảng players + RLS cũ
-- ============================================================================
DROP TABLE IF EXISTS public.players CASCADE;

-- ============================================================================
-- 5. RLS team_members: cho owner + admin (đội trưởng + đội phó) UPDATE
--    (kick = DELETE đã có; deactivate = UPDATE is_active).
-- ============================================================================
DROP POLICY IF EXISTS "Owners can manage members" ON public.team_members;
DROP POLICY IF EXISTS "Owners and admins can manage members" ON public.team_members;
CREATE POLICY "Owners and admins can manage members" ON public.team_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
        AND tm.approval_status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Owners can remove members" ON public.team_members;
DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.team_members;
CREATE POLICY "Owners and admins can remove members" ON public.team_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
        AND tm.approval_status = 'approved'
    )
    -- Cho phép user tự rời đội
    OR user_id = auth.uid()
  );
