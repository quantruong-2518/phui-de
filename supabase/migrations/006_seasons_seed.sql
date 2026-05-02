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
