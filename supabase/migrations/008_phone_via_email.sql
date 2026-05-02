-- Phủ Đê - Phone-as-identifier qua synthetic email
-- Migration: 008_phone_via_email
-- Created: 2026-05-02
--
-- App auth giờ gọi Supabase với email tổng hợp dạng `<digits>@phude.local`
-- (vd `84345913369@phude.local`). Số điện thoại thật được app truyền qua
-- `raw_user_meta_data.phone` lúc signUp.
--
-- Trigger này đảm bảo public.users.phone luôn được set kể cả khi
-- auth.users.phone = NULL (case synthetic email).
--
-- public.users.phone cũng được áp UNIQUE constraint (khi không null) như là
-- defense-in-depth (Supabase email UNIQUE đã ngăn collision phone, đây chỉ
-- là invariant ở app DB).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, role, name, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::text, 'PLAYER'),
    COALESCE((NEW.raw_user_meta_data->>'full_name')::text, ''),
    -- Real phone signup → NEW.phone; synthetic email → raw_user_meta_data.phone
    COALESCE(NEW.phone, (NEW.raw_user_meta_data->>'phone')::text),
    COALESCE((NEW.raw_user_meta_data->>'avatar_url')::text, '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Defense-in-depth: phone uniqueness in public.users
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique
  ON public.users (phone)
  WHERE phone IS NOT NULL AND phone <> '';
