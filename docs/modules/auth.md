# Module: Auth

## Mục đích

Đăng ký + đăng nhập bằng **số điện thoại + mật khẩu** (Supabase Phone Auth, không qua SMS OTP). Mỗi số chỉ có 1 tài khoản (Supabase Auth tự enforce `auth.users.phone` UNIQUE).

Phạm vi MVP: **chỉ role PLAYER**. DB enum vẫn giữ FIELD_OWNER/VENDOR/ADMIN cho tương lai nhưng UI không cho chọn.

## Supabase Dashboard config bắt buộc

- **Authentication → Sign In / Up** → bật **Phone provider**
- **Phone confirmations** → **Tắt** (không gửi OTP, không cần SMS provider)
- (Khuyến nghị) Tắt **Email provider** nếu muốn phone-only thuần

## Bảng & cột

- `auth.users` (Supabase managed) — id, email, password hash, email_confirmed_at
- `public.users` — id (FK auth.users), name, phone, avatar_url, role, onboarding_completed, verification_status
- Trigger `on_auth_user_created` (migration 002) → tự insert row vào `public.users` khi có user mới ở `auth.users`

Xem [[../database/schema|schema]] cho chi tiết.

## Flow

### Đăng ký (phone + password)

1. User submit form `/register` với `phone` + `password` (≥8 ký tự)
2. Client `normalizePhone()` đổi `0345913369` → `+84345913369` (E.164)
3. `supabase.auth.signUp({ phone, password })` → Supabase tạo `auth.users` row với `phone` UNIQUE
4. Trigger DB `handle_new_user` (migration 002 + 007) tự copy `phone` xuống `public.users`, set `role='PLAYER'`, `onboarding_completed=false`
5. Redirect `/login?registered=1`

### Đăng nhập

1. `/login` form: phone + password
2. Client normalize → `signInWithPassword({ phone, password })`
3. Cookie session set. Middleware redirect:
   - `onboarding_completed=false` → `/onboarding`
   - `onboarding_completed=true` → `/teams`

### Quên mật khẩu

Hiện chưa hỗ trợ self-service vì cần SMS OTP. UI báo "liên hệ quản trị viên". Khi có SMS provider → bật `Phone confirmations` + thay form quên mật khẩu bằng OTP flow.

### Đăng xuất

`useAuth().logout()` → `supabase.auth.signOut()` → middleware lần kế redirect `/login`.

## Endpoints

Auth không expose API route riêng — dùng trực tiếp Supabase JS client. Callback duy nhất:

| Method | Path | Mô tả |
|--------|------|------|
| GET | `/auth/callback?code=...&next=...` | Exchange OAuth/magic-link code, redirect tiếp |

## Middleware

`src/middleware.ts`:
- `auth/*`, `_next/*`, `api/*`, `/login`, `/register`, `/` đều public
- Logged-in vào `/login`/`/register` → redirect `/teams`
- Chưa login vào route protected → redirect `/login?next=...`

## Invariants

- Mọi user trong `public.users` có row tương ứng `auth.users` (cascade delete)
- `role` mặc định `'PLAYER'`. Migration 002 trigger COALESCE từ `raw_user_meta_data->role`.
- `onboarding_completed=false` ngay sau register → user phải đi qua [[onboarding]] flow trước khi vào app.

## Failure modes

| Trường hợp | Hành vi |
|-----------|---------|
| User register email đã tồn tại | Supabase trả error → toast |
| User đăng nhập sai password | Supabase trả error → toast |
| Cookie expire giữa request | Middleware refresh; nếu refresh token cũng expire → middleware redirect `/login` |
| User xóa profile row `public.users` (lỗi data) | App bể: query trả null, redirect `/onboarding` infinite. Trigger 002 đảm bảo row luôn được tạo nên ít xảy ra. |

## Frontend touchpoints

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/features/auth/components/{LoginForm,RegisterForm}.tsx`
- `src/features/auth/hooks/use-auth.ts`
- `src/features/auth/validations/auth-schemas.ts`

## See also

- [[onboarding]] — flow tiếp nối sau register
- [[users]] — profile management sau login
- [[../architecture#auth-model]]
