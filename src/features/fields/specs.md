# Fields (Sân bãi) Module

**Status**: MVP shipped (catalog + admin CRUD). Slots/booking pending.
**Owner**: Admin

## 1. Mục đích

Catalog sân bóng do ADMIN duy trì để các đội tham chiếu khi tạo trận và (về sau)
book slot.

## 2. Acceptance Criteria

- [x] Migration `011` table `fields` + indexes + RLS (admin-only mutate, public read).
- [x] Migration `012` thêm `contact_name`, `contact_phone_2`, `contact_name_2`.
- [x] API: `GET /api/fields` (public, search ilike), `POST/PATCH/DELETE` admin.
- [x] Hook `useFields/useCreateField/useUpdateField/useDeleteField` (react-query + axios).
- [x] UI `/admin/(authed)/fields` mobile-first: search, create/edit dialog, list cards.
- [x] `FieldRow` tách ra `features/fields/components/FieldRow.tsx` (dùng chung cho admin & `/bookings`).
- [x] `matches.field_id` (mig 014) — form tạo trận chọn sân từ catalog; `/bookings` reuse `FieldRow` + nút "Đá ở đây" → form prefill.
- [ ] Slot/booking theo khung giờ thật, votes, comments, promotions (roadmap — chưa cần).

## 3. Schema (`fields`)

| Cột | Kiểu | Note |
|-----|------|------|
| id | UUID PK | gen_random_uuid |
| name | TEXT NOT NULL | |
| address | TEXT | |
| google_maps_url | TEXT | link cop từ Google Maps app |
| contact_name | TEXT | tên liên hệ chính |
| contact_phone | TEXT | SĐT chính (gọi/Zalo), regex VN |
| contact_name_2 | TEXT | tên liên hệ phụ |
| contact_phone_2 | TEXT | SĐT phụ |
| pitch_count | INTEGER NOT NULL default 1 | CHECK 1–50 — số sân con tại địa điểm |
| has_camera | BOOLEAN NOT NULL default false | |
| notes | TEXT | meta khác |
| created_by | UUID | FK users ON DELETE SET NULL |
| created_at, updated_at | TIMESTAMPTZ | |

## 4. Validation (`fieldSchema` zod)

- `name`: 2–120 ký tự (required)
- `address`, `notes`: optional, max 500
- `google_maps_url`: optional, URL hợp lệ, max 2000
- `contact_phone[_2]`: optional, regex `^(\+?84|0)\d{9,10}$`
- `contact_name[_2]`: optional, max 80
- `pitch_count`: int 1–50
- `has_camera`: boolean
- Empty strings → null sau transform

## 5. RLS

```sql
-- Public read
CREATE POLICY "Anyone can read fields" FOR SELECT USING (true);

-- Admin mutate (FOR ALL: insert/update/delete)
CREATE POLICY "Admins can manage fields" FOR ALL
  USING ((SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'))
  WITH CHECK (...same);
```

## 6. Frontend touchpoints

- `src/features/fields/types/field.types.ts` — `Field`, `FieldInput`.
- `src/features/fields/validations/field-schemas.ts` — `fieldSchema`.
- `src/features/fields/hooks/use-fields.ts` — react-query hooks.
- `src/features/fields/components/FieldRow.tsx` — card UI dùng chung (admin & `/bookings`); nhận `actions` slot.
- `src/app/admin/(authed)/fields/page.tsx` — server component shell.
- `src/app/admin/(authed)/fields/fields-client.tsx` — client list + dialog form (RHF + zodResolver).
- `src/lib/auth/admin-access.ts` — `requireAdmin()` gate cho API.

## 7. UI rules

- Card: `bg-card rounded-2xl shadow-sm hover:shadow-md`. **No border**.
- Layout 3 row mobile-first:
  1. Tên + `(n sân)` inline | actions (bản đồ, sửa, xoá)
  2. Địa chỉ (truncate)
  3. Contact chips trái | amenity icons phải
- Notes ẩn trên mobile (`hidden sm:block`).
- Form dialog dùng `useForm + zodResolver(fieldSchema)`, `FormMessage` inline.

## 8. Failure modes

| Trường hợp | Xử lý |
|-----------|------|
| Schema cache outdated sau migration | `NOTIFY pgrst, 'reload schema';` |
| Non-admin gọi POST/PATCH/DELETE | RLS reject + `requireAdmin()` 403 |
| SĐT bậy | Zod reject "Số điện thoại không hợp lệ" |
| Pitch count > 50 | Zod reject "Tối đa 50" |

## 9. Luồng "Đặt sân" hiện tại (post-mig 014)

User vào `/bookings`:
1. Header + (nếu có) **Sân quen** = sân của trận mới nhất có `field_id` (qua `GET /api/teams/:slug/recent-field`).
2. Danh sách toàn bộ sân (`useFields`) với search.
3. Mỗi card có nút **"Đá ở đây"** → mở Dialog `MatchScheduleForm` ngay tại /bookings với `defaultFieldId`.
4. Submit → tạo match `scheduled` → navigate `/teams/<slug>/dashboard`.
5. Trận mới xuất hiện trong `UpcomingMatches` (đã wire vào `useMatches(slug, 'scheduled')` thật).

→ Không có khái niệm "giữ slot": booking được derive từ `matches.field_id`.

## 10. Roadmap (chưa làm — không ưu tiên cho MVP)

- `field_slots` + booking khung giờ thật (chỉ làm nếu muốn chống đè slot).
- `field_votes` / rating, `field_comments` (rủ đối), `field_promotions`.

## See also

- [[../../docs/database/schema#fields-migration-011-012]]
- [[../../docs/modules/admin]]
