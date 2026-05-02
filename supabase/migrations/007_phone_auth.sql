-- Phủ Đê - Phone-based authentication
-- Migration: 007_phone_auth
-- Created: 2026-05-02
--
-- Switches the app to phone+password auth. Phone uniqueness is enforced by
-- Supabase Auth itself (auth.users.phone is UNIQUE when not anonymous).
--
-- Update handle_new_user() to also copy phone from auth.users into the
-- public.users profile row, and backfill existing rows.

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
    NEW.phone,
    COALESCE((NEW.raw_user_meta_data->>'avatar_url')::text, '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Backfill phone for existing users (where public.users.phone is empty)
UPDATE public.users u
SET phone = a.phone
FROM auth.users a
WHERE u.id = a.id
  AND a.phone IS NOT NULL
  AND (u.phone IS NULL OR u.phone = '');
