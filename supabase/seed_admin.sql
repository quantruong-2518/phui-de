-- Phủ Đê - Seed admin account
--
-- ⚠️  KHUYẾN NGHỊ: tạo admin qua Supabase Dashboard UI, KHÔNG dùng INSERT trực
--     tiếp vào auth.users. Lý do: bản Supabase mới có rất nhiều cột bắt buộc
--     và logic gotrue, INSERT SQL dễ để row lệch trạng thái → login báo
--     "Database error querying schema".
--
-- BƯỚC ĐÚNG:
--   1. Dashboard → Authentication → Users → Add user → Create new user
--      Email:    admin@phude.local
--      Password: madin@2023
--      Auto Confirm User: ✓
--   2. Chạy SQL bên dưới để promote thành ADMIN.

UPDATE public.users
SET role = 'ADMIN',
    name = COALESCE(name, 'Admin'),
    onboarding_completed = true,
    updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@phude.local');

-- Verify
SELECT u.email,
       p.role,
       p.name,
       p.onboarding_completed
FROM auth.users u
JOIN public.users p ON p.id = u.id
WHERE u.email = 'admin@phude.local';
