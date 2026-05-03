-- Phủ Đê - Fix riêng auth.identities cho admin
-- Chạy file này nếu seed_admin.sql đã chạy nhưng login vẫn lỗi
-- "Database error querying schema". Thường nghĩa là row auth.identities
-- chưa có hoặc thiếu cột.
--
-- Idempotent. Tự dò schema để chạy được trên cả Supabase phiên bản cũ
-- (chỉ có id, user_id, identity_data, provider) lẫn mới (kèm provider_id).

DO $$
DECLARE
  admin_id    UUID := '00000000-0000-0000-0000-0000000ad000';
  admin_email TEXT := 'admin@phude.local';
  has_pid     BOOLEAN;
BEGIN
  -- 1. Đảm bảo auth.users tồn tại (lấy id thực tế nếu khác)
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Chưa thấy auth.users với email %. Chạy seed_admin.sql trước.', admin_email;
  END IF;

  -- 2. Xoá row identity cũ (nếu có) để tránh conflict / NULL
  DELETE FROM auth.identities WHERE user_id = admin_id;

  -- 3. Phát hiện schema có cột provider_id không
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='auth' AND table_name='identities' AND column_name='provider_id'
  ) INTO has_pid;

  IF has_pid THEN
    -- Schema mới (provider_id NOT NULL)
    EXECUTE format($q$
      INSERT INTO auth.identities (provider_id, user_id, identity_data, provider,
                                   last_sign_in_at, created_at, updated_at)
      VALUES (%L::text, %L::uuid,
              jsonb_build_object('sub', %L::text, 'email', %L,
                                 'email_verified', true,
                                 'phone_verified', false),
              'email', NOW(), NOW(), NOW())
    $q$, admin_id, admin_id, admin_id, admin_email);
  ELSE
    -- Schema cũ (chỉ id/user_id/identity_data/provider)
    EXECUTE format($q$
      INSERT INTO auth.identities (id, user_id, identity_data, provider,
                                   last_sign_in_at, created_at, updated_at)
      VALUES (gen_random_uuid(), %L::uuid,
              jsonb_build_object('sub', %L::text, 'email', %L,
                                 'email_verified', true),
              'email', NOW(), NOW(), NOW())
    $q$, admin_id, admin_id, admin_email);
  END IF;

  RAISE NOTICE 'Đã fix identity cho admin (id=%, schema_new=%).', admin_id, has_pid;
END $$;

-- Verify
SELECT u.email,
       u.encrypted_password IS NOT NULL AS has_pw,
       i.provider,
       i.identity_data->>'email' AS identity_email
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
WHERE u.email = 'admin@phude.local';
