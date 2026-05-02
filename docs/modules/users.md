# Module: Users

## Mục đích

CRUD profile của user hiện tại (name, phone, avatar).

## Bảng

- `public.users` — id, name, phone, avatar_url, role, onboarding_completed, verification_status

## Endpoints

| Method | Path | Auth | Body / Note |
|--------|------|------|------|
| GET | `/api/users/me` | required | Trả profile + email |
| PATCH | `/api/users/me` | required | `{ name?, phone?, avatar_url? }` |

## Validation

```typescript
const patchSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().regex(/^(\+?84|0)\d{9,10}$/).optional(),
  avatar_url: z.string().url().nullable().optional(),
}).refine((d) => Object.keys(d).length > 0);
```

## Other-user profiles

Để xem profile user khác (không phải mình) → đọc qua view `user_public_profiles` (migration 005). View tự ẩn `phone` nếu caller không phải:
- Chính chủ (id = auth.uid())
- Cùng team với row đó

```sql
SELECT id, name, avatar_url, phone FROM public.user_public_profiles WHERE id = '...';
```

## Invariants

- `users.id = auth.users.id` (1-1 cascade)
- `name` có thể null (migration 002 dropped NOT NULL) — UI nên hiển thị fallback
- `phone` không có DB-level format check; chỉ enforce ở API zod

## Frontend touchpoints

Chưa có UI riêng (tab profile chưa build). Hook gợi ý:

```typescript
// src/features/users/hooks/use-current-user.ts (chưa có, nên tạo khi UI cần)
useQuery({ queryKey: ['users', 'me'], queryFn: () => api.get('/api/users/me') })
```

## See also

- [[auth]]
- [[onboarding]] — endpoint PATCH `/api/onboarding` cũng update name+phone (overlap có chủ đích)
- [[../database/rls#users]] — RLS policies + `user_public_profiles` view
