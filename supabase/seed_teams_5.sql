-- Seed: 5 đội bóng (PassionFC + 4 đội khác)
-- Mỗi đội có 1 owner placeholder (không login được — dùng để giữ FK).
-- Idempotent: chạy lại không nhân bản.
--
-- Chạy ở Supabase Dashboard SQL Editor (service_role).

DO $$
DECLARE
  v_season_id UUID;
  rec RECORD;
  v_team_id UUID;
BEGIN
  SELECT id INTO v_season_id FROM public.seasons WHERE is_active = true LIMIT 1;

  FOR rec IN
    SELECT * FROM (VALUES
      ('PassionFC',  'passionfc',  'PASS001', '#22c55e', 'b1000000-0000-0000-0000-000000000001'::uuid, 'Owner PassionFC'),
      ('Love',       'love',       'LOV001',  '#ef4444', 'b1000000-0000-0000-0000-000000000002'::uuid, 'Owner Love'),
      ('Lego',       'lego',       'LEG001',  '#facc15', 'b1000000-0000-0000-0000-000000000003'::uuid, 'Owner Lego'),
      ('Bể Cồn',     'be-con',     'BCO001',  '#3b82f6', 'b1000000-0000-0000-0000-000000000004'::uuid, 'Owner Bể Cồn'),
      ('Máy Xúc',    'may-xuc',    'MXC001',  '#f97316', 'b1000000-0000-0000-0000-000000000005'::uuid, 'Owner Máy Xúc')
    ) AS t(name, slug, code, color, owner_id, owner_name)
  LOOP
    -- 1. auth.users (placeholder, không login được vì email fake)
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
    ) VALUES (
      rec.owner_id::uuid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'placeholder-' || rec.slug || '@phude-internal.app',
      crypt('placeholder!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', rec.owner_name),
      false, false
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. public.users — cập nhật tên + đánh dấu onboarded
    UPDATE public.users
    SET name = rec.owner_name, onboarding_completed = true, updated_at = NOW()
    WHERE id = rec.owner_id::uuid;

    -- 3. teams
    INSERT INTO public.teams (name, slug, code, primary_color, secondary_color, owner_id)
    VALUES (rec.name, rec.slug, rec.code, rec.color, '#ffffff', rec.owner_id::uuid)
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      code = EXCLUDED.code,
      primary_color = EXCLUDED.primary_color
    RETURNING id INTO v_team_id;

    -- 4. team_seasons
    IF v_season_id IS NOT NULL THEN
      INSERT INTO public.team_seasons (team_id, season_id, matches_played)
      VALUES (v_team_id, v_season_id, 0)
      ON CONFLICT (team_id, season_id) DO NOTHING;
    END IF;

    -- 5. team_members: owner = captain, approved
    INSERT INTO public.team_members (
      team_id, user_id, season_id, role,
      team_role_id, team_role_label,
      approval_status, approved_by, approved_at
    ) VALUES (
      v_team_id, rec.owner_id::uuid, v_season_id, 'owner',
      'captain', 'Đội trưởng',
      'approved', rec.owner_id::uuid, NOW()
    ) ON CONFLICT (team_id, user_id, season_id) DO UPDATE SET
      role = 'owner', approval_status = 'approved';

    -- 6. onboarding_data
    INSERT INTO public.onboarding_data (user_id, status, team_id, role_id, custom_role)
    VALUES (rec.owner_id::uuid, 'team_member', v_team_id, 'captain', 'Đội trưởng (Owner)')
    ON CONFLICT (user_id) DO UPDATE SET
      team_id = v_team_id, role_id = 'captain', custom_role = 'Đội trưởng (Owner)';

    RAISE NOTICE 'Seeded team: % (%)', rec.name, rec.slug;
  END LOOP;
END $$;

-- Verify
SELECT name, slug, code, primary_color, created_at
FROM public.teams
ORDER BY created_at DESC;
