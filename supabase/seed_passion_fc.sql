-- Seed: PassionFC + 2 members
-- Tạo 2 auth.users tối thiểu để có FK hợp lệ cho team_members.
-- Email + password là placeholder (không dùng để login thực) — bạn vẫn nên đăng ký
-- qua /register cho user thật nếu muốn login làm Quân/Vũ.
--
-- Chạy file này trong Supabase Dashboard SQL Editor (có quyền service_role).
-- Idempotent: chạy lại nhiều lần không hỏng dữ liệu.

DO $$
DECLARE
  quan_id UUID := 'a0000000-0000-0000-0000-000000000001';
  vu_id   UUID := 'a0000000-0000-0000-0000-000000000002';
  v_team_id UUID;
  v_season_id UUID;
BEGIN
  -- 1. auth.users (placeholder credentials, idempotent)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_sso_user, is_anonymous
  ) VALUES (
    quan_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'quan.truong@passionfc.local', crypt('seedpass123!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Quân Trương"}'::jsonb,
    false, false
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_sso_user, is_anonymous
  ) VALUES (
    vu_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'vu.hoang@passionfc.local', crypt('seedpass123!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Vũ Hoàng"}'::jsonb,
    false, false
  ) ON CONFLICT (id) DO NOTHING;

  -- 2. public.users — insert tường minh (không dựa trigger, vì auth.users
  -- ON CONFLICT DO NOTHING ở trên có thể skip → trigger không fire).
  INSERT INTO public.users (id, role, name, phone, onboarding_completed)
  VALUES (quan_id, 'PLAYER', 'Quân Trương', '0345913369', true)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    onboarding_completed = true,
    updated_at = NOW();

  INSERT INTO public.users (id, role, name, phone, onboarding_completed)
  VALUES (vu_id, 'PLAYER', 'Vũ Hoàng', '0333874206', true)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    onboarding_completed = true,
    updated_at = NOW();

  -- 3. Active season
  SELECT id INTO v_season_id FROM public.seasons WHERE is_active = true LIMIT 1;

  -- 4. Team (seed = pre-approved)
  INSERT INTO public.teams (
    name, slug, code, primary_color, secondary_color, owner_id,
    approval_status, approved_at, approved_by
  )
  VALUES (
    'PassionFC', 'passionfc', 'PASS001', '#22c55e', '#ffffff', quan_id,
    'approved', NOW(), quan_id
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    owner_id = EXCLUDED.owner_id,
    approval_status = 'approved',
    approved_at = COALESCE(public.teams.approved_at, NOW())
  RETURNING id INTO v_team_id;

  -- 5. Team season hookup
  IF v_season_id IS NOT NULL THEN
    INSERT INTO public.team_seasons (team_id, season_id, matches_played)
    VALUES (v_team_id, v_season_id, 0)
    ON CONFLICT (team_id, season_id) DO NOTHING;
  END IF;

  -- 6. Members: Quân (owner+captain), Vũ (admin+vice_captain)
  INSERT INTO public.team_members (
    team_id, user_id, season_id, role,
    team_role_id, team_role_label,
    approval_status, approved_by, approved_at
  ) VALUES (
    v_team_id, quan_id, v_season_id, 'owner',
    'captain', 'Đội trưởng',
    'approved', quan_id, NOW()
  ) ON CONFLICT (team_id, user_id, season_id) DO UPDATE SET
    role = 'owner',
    team_role_id = 'captain',
    team_role_label = 'Đội trưởng',
    approval_status = 'approved';

  INSERT INTO public.team_members (
    team_id, user_id, season_id, role,
    team_role_id, team_role_label,
    approval_status, approved_by, approved_at
  ) VALUES (
    v_team_id, vu_id, v_season_id, 'admin',
    'vice_captain', 'Đội phó',
    'approved', quan_id, NOW()
  ) ON CONFLICT (team_id, user_id, season_id) DO UPDATE SET
    role = 'admin',
    team_role_id = 'vice_captain',
    team_role_label = 'Đội phó',
    approval_status = 'approved';

  -- 7. Onboarding data
  INSERT INTO public.onboarding_data (user_id, status, team_id, role_id, custom_role)
  VALUES (quan_id, 'team_member', v_team_id, 'captain', 'Đội trưởng (Owner)')
  ON CONFLICT (user_id) DO UPDATE SET
    team_id = v_team_id, role_id = 'captain', custom_role = 'Đội trưởng (Owner)';

  INSERT INTO public.onboarding_data (user_id, status, team_id, role_id, custom_role)
  VALUES (vu_id, 'team_member', v_team_id, 'vice_captain', 'Đội phó')
  ON CONFLICT (user_id) DO UPDATE SET
    team_id = v_team_id, role_id = 'vice_captain', custom_role = 'Đội phó';

  RAISE NOTICE 'Seed OK — team_id=%, members=2', v_team_id;
END $$;
