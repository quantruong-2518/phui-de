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
  admin_email TEXT := 'admin@phude.local';
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
    admin_email, crypt('madin@2023', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin"}'::jsonb,
    false, false
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    raw_app_meta_data = EXCLUDED.raw_app_meta_data,
    updated_at = NOW();

  -- 2. auth.identities — BẮT BUỘC ở Supabase mới, không có row này thì
  -- signInWithPassword sẽ trả "Database error querying schema".
  INSERT INTO auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    admin_id::text,
    admin_id,
    jsonb_build_object(
      'sub',            admin_id::text,
      'email',          admin_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    NOW(), NOW(), NOW()
  )
  ON CONFLICT (provider, provider_id) DO UPDATE SET
    identity_data    = EXCLUDED.identity_data,
    last_sign_in_at  = EXCLUDED.last_sign_in_at,
    updated_at       = NOW();

  -- 3. public.users — role ADMIN. Trigger handle_new_user có thể đã tạo row
  -- với role=PLAYER nếu auth.users là INSERT mới — UPSERT ép về ADMIN.
  INSERT INTO public.users (id, role, name, onboarding_completed)
  VALUES (admin_id, 'ADMIN', 'Admin', true)
  ON CONFLICT (id) DO UPDATE SET
    role = 'ADMIN',
    name = COALESCE(public.users.name, 'Admin'),
    onboarding_completed = true,
    updated_at = NOW();
END $$;
