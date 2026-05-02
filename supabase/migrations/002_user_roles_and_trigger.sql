-- Migration 002: User Roles and Auth Trigger

-- 1. Add role-related columns to public.users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('PLAYER', 'FIELD_OWNER', 'VENDOR', 'ADMIN')) DEFAULT 'PLAYER',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')) DEFAULT 'PENDING';

-- 2. Make name optional since users might not provide it immediately at registration
ALTER TABLE public.users ALTER COLUMN name DROP NOT NULL;

-- 3. Create a function to automatically insert a user profile when they sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, role, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::text, 'PLAYER'),
    COALESCE((NEW.raw_user_meta_data->>'full_name')::text, ''),
    COALESCE((NEW.raw_user_meta_data->>'avatar_url')::text, '')
  );
  RETURN NEW;
END;
$$;

-- 4. Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
