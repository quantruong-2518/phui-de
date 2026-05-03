-- Phủ Đê - Liên kết matches với catalog fields
-- Migration: 014_matches_field_id
-- Created: 2026-05-03
--
-- Bối cảnh: hiện `matches.field` là TEXT free-form. Để đội log trận có thể
-- chọn sân từ catalog (`fields`), thêm `field_id` FK. Cột text cũ giữ lại
-- làm fallback cho trận tạo trước khi có catalog (hoặc sân ngoài catalog).
--
-- Idempotent.

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_matches_field_id ON public.matches (field_id);

COMMENT ON COLUMN public.matches.field_id IS
  'FK sang catalog fields. NULL = sân ngoài catalog hoặc chưa pick.';
COMMENT ON COLUMN public.matches.field    IS
  'Tên sân free-form, fallback khi field_id NULL.';
