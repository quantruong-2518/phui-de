-- Phủ Đê - Seed admin account
-- Tạo 1 tài khoản ADMIN dùng để vào /admin/* quản lý sân bãi (và các module
-- admin khác sau này).
--
-- Username (UI):  admin
-- Password:       madin@2023
-- Email nội bộ:   admin@phude.local
--
-- Idempotent: chạy lại nhiều lần không hỏng dữ liệu.
-- Yêu cầu: chạy bằng quyền service_role (Supabase SQL Editor mặc định OK).

DO $$
DECLARE
  admin_id UUID := '00000000-0000-0000-0000-0000000ad000';
BEGIN
  -- 1. auth.users
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_sso_user, is_anonymous
  ) VALUES (
    admin_id, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'admin@phude.local', crypt('madin@2023', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin"}'::jsonb,
    false, false
  ) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    updated_at = NOW();

  -- 2. public.users — role ADMIN
  INSERT INTO public.users (id, role, name, onboarding_completed)
  VALUES (admin_id, 'ADMIN', 'Admin', true)
  ON CONFLICT (id) DO UPDATE SET
    role = 'ADMIN',
    onboarding_completed = true,
    updated_at = NOW();
END $$;
