-- Phủ Đê - matches: thêm giờ thi đấu chính xác
-- Migration: 015_matches_match_time
-- Created: 2026-05-03
--
-- Trước: chỉ có `match_date DATE`. Không biết trận giờ nào → không gate
-- được nút "Bắt đầu" theo thời điểm thật.
-- Sau: thêm `match_time TIME` (HH:MM:SS). Default 19:00 cho rows cũ.
--
-- Idempotent.

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS match_time TIME NOT NULL DEFAULT '19:00';

COMMENT ON COLUMN public.matches.match_time IS
  'Giờ kick-off (local). Cùng với match_date xác định thời điểm "Bắt đầu" được enable.';
