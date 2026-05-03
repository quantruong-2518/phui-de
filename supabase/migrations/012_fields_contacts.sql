-- Phủ Đê - fields: thêm tên người liên hệ + slot SĐT thứ 2
-- Migration: 012_fields_contacts
-- Created: 2026-05-03
--
-- Trước: 1 số liên hệ duy nhất (`contact_phone`).
-- Sau: 2 cặp (tên + SĐT) — `contact_name`/`contact_phone` cho người chính,
--      `contact_name_2`/`contact_phone_2` cho người phụ (tuỳ chọn).
-- Idempotent.

ALTER TABLE public.fields
  ADD COLUMN IF NOT EXISTS contact_name    TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone_2 TEXT,
  ADD COLUMN IF NOT EXISTS contact_name_2  TEXT;

COMMENT ON COLUMN public.fields.contact_name    IS 'Tên người liên hệ chính.';
COMMENT ON COLUMN public.fields.contact_phone_2 IS 'SĐT liên hệ phụ (gọi/Zalo). Tuỳ chọn.';
COMMENT ON COLUMN public.fields.contact_name_2  IS 'Tên người liên hệ phụ.';
