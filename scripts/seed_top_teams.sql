DO $$
DECLARE
  v_owner_id UUID;
  v_season_id UUID;
BEGIN
  -- Xóa hết dữ liệu cũ
  DELETE FROM public.teams WHERE true;

  -- Lấy đại 1 user bất kỳ làm owner
  SELECT id INTO v_owner_id FROM public.users LIMIT 1;
  SELECT id INTO v_season_id FROM public.seasons WHERE is_active = true LIMIT 1;

  IF v_season_id IS NOT NULL THEN
    -- Top 5: Trẻ NK
    INSERT INTO public.teams (name, slug, code, primary_color, owner_id, created_at)
    VALUES ('Trẻ NK', 'tre-nk', 'TRENK', '#1A1A1A', v_owner_id, NOW() - INTERVAL '4 minutes')
    ON CONFLICT (slug) DO NOTHING;

    -- Top 4: Love
    INSERT INTO public.teams (name, slug, code, primary_color, owner_id, created_at)
    VALUES ('Love', 'love', 'LOVE', '#FF69B4', v_owner_id, NOW() - INTERVAL '3 minutes')
    ON CONFLICT (slug) DO NOTHING;

    -- Top 3: Lego
    INSERT INTO public.teams (name, slug, code, primary_color, owner_id, created_at)
    VALUES ('Lego', 'lego', 'LEGO', '#FFFF00', v_owner_id, NOW() - INTERVAL '2 minutes')
    ON CONFLICT (slug) DO NOTHING;

    -- Top 2: 3233
    INSERT INTO public.teams (name, slug, code, primary_color, owner_id, created_at)
    VALUES ('3233', '3233', 'T3233', '#0000FF', v_owner_id, NOW() - INTERVAL '1 minute')
    ON CONFLICT (slug) DO NOTHING;

    -- Top 1: Passion FC
    INSERT INTO public.teams (name, slug, code, primary_color, owner_id, created_at)
    VALUES ('Passion FC', 'passion-fc', 'PAS01', '#BFFF00', v_owner_id, NOW())
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;
