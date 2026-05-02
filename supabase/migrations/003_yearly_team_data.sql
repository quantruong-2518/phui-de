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
