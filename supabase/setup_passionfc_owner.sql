-- Gắn account thật (phone = 0345913369) làm owner + captain của PassionFC.
-- Chạy file này SAU KHI người dùng đã đăng ký qua app (qua /register, phone
-- 0345913369). Nếu không tìm thấy user, script sẽ raise notice và không thay đổi gì.
--
-- Idempotent: chạy lại nhiều lần không hỏng dữ liệu.

DO $$
DECLARE
  v_real_user UUID;
  v_team_id   UUID;
  v_season_id UUID;
BEGIN
  -- 1. Tìm user thật theo số điện thoại
  SELECT id INTO v_real_user
  FROM public.users
  WHERE phone = '0345913369'
  LIMIT 1;

  IF v_real_user IS NULL THEN
    RAISE NOTICE 'Chưa thấy user phone=0345913369 trong public.users. Hãy đăng ký qua /register trước rồi chạy lại.';
    RETURN;
  END IF;

  -- 2. Đảm bảo team PassionFC tồn tại + đã duyệt
  SELECT id INTO v_team_id FROM public.teams WHERE slug = 'passionfc' LIMIT 1;
  IF v_team_id IS NULL THEN
    INSERT INTO public.teams (
      name, slug, code, primary_color, secondary_color, owner_id,
      approval_status, approved_at, approved_by
    )
    VALUES (
      'PassionFC', 'passionfc', 'PASS001', '#22c55e', '#ffffff', v_real_user,
      'approved', NOW(), v_real_user
    )
    RETURNING id INTO v_team_id;
  ELSE
    UPDATE public.teams
    SET owner_id = v_real_user,
        approval_status = 'approved',
        approved_at = COALESCE(approved_at, NOW()),
        approved_by = COALESCE(approved_by, v_real_user)
    WHERE id = v_team_id;
  END IF;

  -- 3. Active season
  SELECT id INTO v_season_id FROM public.seasons WHERE is_active = true LIMIT 1;

  -- 4. Hookup team_seasons (best-effort)
  IF v_season_id IS NOT NULL THEN
    INSERT INTO public.team_seasons (team_id, season_id, matches_played)
    VALUES (v_team_id, v_season_id, 0)
    ON CONFLICT (team_id, season_id) DO NOTHING;
  END IF;

  -- 5. Xoá member rows cũ thuộc team này nhưng user đã không còn (placeholder
  --    Quân Trương fake UUID a0000000-0000-0000-0000-000000000001) — chỉ xoá
  --    nếu user đó không tồn tại nữa hoặc khác user thật.
  DELETE FROM public.team_members
  WHERE team_id = v_team_id
    AND user_id <> v_real_user
    AND role = 'owner';

  -- 6. Gắn user thật làm owner+captain (approved)
  INSERT INTO public.team_members (
    team_id, user_id, season_id, role,
    team_role_id, team_role_label,
    approval_status, approved_by, approved_at
  ) VALUES (
    v_team_id, v_real_user, v_season_id, 'owner',
    'captain', 'Đội trưởng',
    'approved', v_real_user, NOW()
  )
  ON CONFLICT (team_id, user_id, season_id) DO UPDATE SET
    role = 'owner',
    team_role_id = 'captain',
    team_role_label = 'Đội trưởng',
    approval_status = 'approved',
    approved_at = COALESCE(public.team_members.approved_at, NOW()),
    approved_by = v_real_user;

  -- 7. Onboarding data cho user thật (nếu chưa có)
  INSERT INTO public.onboarding_data (user_id, status, team_id, role_id, custom_role)
  VALUES (v_real_user, 'team_member', v_team_id, 'captain', 'Đội trưởng (Owner)')
  ON CONFLICT (user_id) DO UPDATE SET
    team_id = v_team_id,
    role_id = 'captain',
    custom_role = 'Đội trưởng (Owner)';

  UPDATE public.users
  SET onboarding_completed = true, updated_at = NOW()
  WHERE id = v_real_user;

  RAISE NOTICE 'OK — user_id=%, team_id=%', v_real_user, v_team_id;
END $$;
