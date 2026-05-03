# Module: Admin

## Mục đích

Khu vực `/admin/*` để **account ADMIN** quản lý dữ liệu cấp hệ thống mà không liên quan tới flow user phone-based:

- Sân bãi (fields) — module đầu tiên có UI admin.
- Tương lai: duyệt team (`teams.approval_status`), promotions, bookings, …

## Auth flow tách riêng

User thông thường: phone + password (chuyển thành email nội bộ `<phone>@phude-auth.app` ở `auth.users`).
Admin: username/password thường — **không bắt nhập phone**.

| | User flow | Admin flow |
|---|---|---|
| Path | `/login` | `/admin/login` |
| Identifier | Số điện thoại | Username (`admin`) |
| Email nội bộ | `<phone>@phude-auth.app` | `admin@phude.local` |
| Onboarding | Có (nhập tên + tạo/join đội) | Không |
| Role check | `team_members` | `users.role = 'ADMIN'` |

Mapping `username → email` ở `src/app/admin/login/login-form.tsx`:

```ts
const USERNAME_TO_EMAIL: Record<string, string> = { admin: 'admin@phude.local' };
```

## Seed admin

File `supabase/seed_admin.sql`. Chạy 1 lần qua Supabase SQL Editor:

- `auth.users` row email `admin@phude.local`, password hash `bf` (bcrypt).
- `public.users` row `role='ADMIN'`, `onboarding_completed=true`.

Idempotent — chạy lại reset password & role.

Default credentials (MVP, chưa rotate):

```
username: admin
password: madin@2023
```

## Middleware

`src/middleware.ts` skip toàn bộ `/admin/*` (treat as public). Layout `src/app/admin/(authed)/layout.tsx` tự gate:

- Không có user → redirect `/admin/login`.
- Có user nhưng `users.role !== 'ADMIN'` → redirect `/admin/login`.

Login page (`/admin/login/page.tsx`) tự redirect về `/admin/fields` nếu đã là admin.

## Pages

| Path | Mô tả |
|------|------|
| `/admin/login` | Form username/password. |
| `/admin` | Redirect → `/admin/fields`. |
| `/admin/fields` | List sân + dialog tạo/sửa/xoá. |

## Endpoints

API gate bằng `requireAdmin()` (`src/lib/auth/admin-access.ts`).

| Method | Path | Auth | Mô tả |
|--------|------|------|------|
| GET | `/api/fields?search=` | public | List sân, search ilike `name` |
| POST | `/api/fields` | admin | Tạo sân, validate `fieldSchema` |
| PATCH | `/api/fields/[id]` | admin | Update partial |
| DELETE | `/api/fields/[id]` | admin | Xoá hẳn |

## See also

- [[../database/schema#fields-migration-011]]
- [[../../supabase/seed_admin.sql]]
