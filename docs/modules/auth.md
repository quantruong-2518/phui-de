# Module: Auth

## Mục đích

UX phone-only: user đăng ký + đăng nhập bằng **số điện thoại + mật khẩu**. Phone không cần verify (không SMS, không OTP). Mỗi số 1 tài khoản, tự enforce qua Supabase Auth + UNIQUE INDEX trên `public.users.phone`.

Phạm vi MVP: **chỉ role PLAYER**. DB enum vẫn giữ FIELD_OWNER/VENDOR/ADMIN cho tương lai nhưng UI không cho chọn.

## Implementation: synthetic email token

Supabase Auth bắt buộc 1 identifier — dùng phone trực tiếp đụng vào Phone provider (đòi SMS provider). Workaround: tự sinh **email token** từ phone:

```
phone "0345913369"  ─normalizePhone()→  "+84345913369"
                    ─phoneToAuthToken()→  "84345913369@phude-auth.app"
```

`@phude-auth.app` chỉ là format (không phải domain thật, không gửi mail). Email này:
- Nằm ở `auth.users.email` để Supabase chấp nhận
- KHÔNG bao giờ hiển thị/select trong app — UI luôn phone
- Phone thật lưu ở `public.users.phone` qua trigger (đọc từ `raw_user_meta_data.phone` truyền lúc signUp)

Phone uniqueness được đảm bảo 2 tầng:
1. `auth.users.email` UNIQUE (Supabase enforce) → 2 phone khác nhau → 2 email token khác → không trùng
2. `idx_users_phone_unique` trên `public.users.phone WHERE NOT NULL` (migration 008)

## Supabase Dashboard config bắt buộc

https://supabase.com/dashboard/project/<ref>/auth/providers

- **Email provider** → **Enable**
- **Confirm email** → **TẮT** (vì email là token fake, không có inbox để click confirm)
- Phone provider có/không đều được, không xài

## Bảng & cột

- `auth.users` (Supabase managed) — id, email, password hash, email_confirmed_at
- `public.users` — id (FK auth.users), name, phone, avatar_url, role, onboarding_completed, verification_status
- Trigger `on_auth_user_created` (migration 002) → tự insert row vào `public.users` khi có user mới ở `auth.users`

Xem [[../database/schema|schema]] cho chi tiết.

## Flow

### Đăng ký

1. User submit form `/register` với `phone` + `password` (≥8 ký tự)
2. Client `normalizePhone()` đổi `0345913369` → `+84345913369`
3. Client `phoneToAuthToken()` đổi `+84345913369` → `84345913369@phude-auth.app`
4. `supabase.auth.signUp({ email: token, password, options: { data: { phone } } })`
5. Trigger DB `handle_new_user` (migration 002 + 008) tự ghi `public.users`:
   - `phone` lấy từ `NEW.phone` (case real phone auth) hoặc `raw_user_meta_data.phone` (case synthetic — đây)
   - `role = 'PLAYER'`, `onboarding_completed = false`
6. Redirect `/login?registered=1`

### Đăng nhập

1. `/login` form: phone + password
2. Client `phoneToAuthToken(phone)` → email token
3. `signInWithPassword({ email: token, password })`
4. Cookie session set. Middleware redirect:
   - `onboarding_completed = false` → `/onboarding`
   - `onboarding_completed = true` → `/teams`

### Lỗi Supabase thường gặp

| Message | Nguyên nhân | Fix |
|---|---|---|
| "Email signups are disabled" | Email provider chưa bật | Dashboard → Email → Enable |
| "Email address invalid" | TLD bị reject (.local, .test, …) | Code đã dùng `.app` (TLD thật) |
| "Phone signups are disabled" | Code cũ gọi `signUp({ phone })` | Đảm bảo dùng `phoneToAuthToken` |

### Quên mật khẩu

Hiện chưa hỗ trợ self-service vì email là token fake (không reset link tới được). UI `/forgot-password` báo "liên hệ admin". Khi muốn bật → cần đổi sang Phone Auth thật (cấu hình SMS provider) hoặc tích hợp SMS OTP qua provider riêng.

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
