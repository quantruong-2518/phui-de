-- Phủ Đê - Catalog sân bóng
-- Migration: 011_fields
-- Created: 2026-05-03
--
-- Bảng `fields` lưu thông tin các sân bóng để dùng cho tab Đặt sân và replace
-- column `matches.field` (text free-form) bằng FK lookup ở các module sau.
--
-- MVP scope: catalog do ADMIN duy trì. Đội xem & book theo slot khi tạo trận.
-- Read: public.  Mutate (insert/update/delete): chỉ `users.role = 'ADMIN'`.
--
-- Future scope (chưa làm):
--   - field_slots: khung giờ mở của từng sân con (theo `pitch_count`).
--   - bookings: 1 đội đặt 1 slot, có status (open/locked/cancelled).
--   - field_votes / field_comments: rating + thảo luận book đối.
--   - field_promotions: thông báo giảm giá từ admin sân.

-- ============================================================================
-- 1. Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fields (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  address         TEXT,
  google_maps_url TEXT,                              -- cop link từ Google Maps
  contact_phone   TEXT,                              -- số gọi/Zalo
  pitch_count     INTEGER     NOT NULL DEFAULT 1
                              CHECK (pitch_count >= 1 AND pitch_count <= 50),
  has_camera      BOOLEAN     NOT NULL DEFAULT false,
  notes           TEXT,                              -- meta khác: giá, size, ghi chú
  created_by      UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_fields_name        ON public.fields (name);
CREATE INDEX IF NOT EXISTS idx_fields_created_by  ON public.fields (created_by);

-- ============================================================================
-- 3. updated_at trigger (reuse function từ migration 001)
-- ============================================================================
DROP TRIGGER IF EXISTS update_fields_updated_at ON public.fields;
CREATE TRIGGER update_fields_updated_at
  BEFORE UPDATE ON public.fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. RLS
-- ============================================================================
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

-- Read: public (ai cũng xem được catalog).
DROP POLICY IF EXISTS "Anyone can read fields" ON public.fields;
CREATE POLICY "Anyone can read fields" ON public.fields
  FOR SELECT USING (true);

-- Mutate (insert/update/delete): chỉ ADMIN.
DROP POLICY IF EXISTS "Admins can manage fields" ON public.fields;
CREATE POLICY "Admins can manage fields" ON public.fields
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'ADMIN'
    )
  );

-- ============================================================================
-- 5. Comment cho schema docs
-- ============================================================================
COMMENT ON TABLE  public.fields IS 'Catalog sân bóng cộng đồng. User-contributed.';
COMMENT ON COLUMN public.fields.google_maps_url IS 'Link cop trực tiếp từ Google Maps app.';
COMMENT ON COLUMN public.fields.contact_phone   IS 'Số điện thoại — dùng được cho gọi & Zalo.';
COMMENT ON COLUMN public.fields.pitch_count     IS 'Số sân con tại địa điểm này.';
COMMENT ON COLUMN public.fields.has_camera      IS 'Có hệ thống camera quay trận hay không.';
