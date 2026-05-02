# Role permissions

Mỗi `team_members` row có 2 cột vai trò:

- `role`: `'owner' | 'admin' | 'member'` — quyết định **quyền hạn** trong đội.
- `team_role_id` / `team_role_label`: nhãn nghiệp vụ (`captain`, `vice_captain`, `member`, ...) — chỉ để hiển thị, KHÔNG dùng cho phân quyền.

Tương ứng quen thuộc:

| Nghiệp vụ      | role     | team_role_id   |
| -------------- | -------- | -------------- |
| Đội trưởng     | `owner`  | `captain`      |
| Đội phó        | `admin`  | `vice_captain` |
| Thành viên     | `member` | `member` / khác |

## Bảng quyền

|                                          | Owner (đội trưởng) | Admin (đội phó) | Member (thành viên) |
| ---------------------------------------- | :----------------: | :-------------: | :-----------------: |
| Xem trang đội (dashboard / members / …)  |         ✅          |        ✅        |          ✅          |
| Duyệt / từ chối yêu cầu tham gia         |         ✅          |        ✅        |          ❌          |
| Sửa số áo / vị trí cầu thủ               |         ✅          |        ✅        |          ❌          |
| Kick member                              |    ✅ (mọi target)    |  ✅ chỉ member  |   ✅ tự rời đội   |
| Dừng / mở hoạt động                      |    ✅ (mọi target)    |  ✅ chỉ member  |          ❌          |
| Cấp / thu hồi quyền đội phó              |         ✅          |        ❌        |          ❌          |
| Sửa team (tên, màu, slug, …)             |         ✅          |        ❌\*       |          ❌          |
| Xoá team / huỷ team                      |         ✅          |        ❌        |          ❌          |

\* Hiện tại RLS chỉ cho owner update teams. Nếu cần admin cùng sửa, xem
`migrations/001_initial_schema.sql` policy "Owners can update teams".

## Bất biến cứng

- **Owner luôn được bảo vệ.** Không ai (kể cả admin khác) đổi role / dừng hoạt động / kick được owner. Chỉ owner tự đổi quyền (qua flow chuyển giao đội — chưa có trong MVP).
- **Admin không thao tác lên admin khác.** Tránh cảnh 2 đội phó "kick xoay vòng" lẫn nhau. Chỉ owner mới demote/kick được admin.
- **User được tự rời đội** (DELETE row của chính mình) — kể cả member thường, không cần admin/owner duyệt.
- **Mọi role-change đều cần owner** (server enforce qua `requireTeamAccess({ minRole: 'owner' })` + trigger `guard_team_member_role`).

## Implementation

- Hàm `can(action, { viewer, target, isSelf })` ở `src/lib/auth/permissions.ts` là single source of truth. UI dùng để ẩn nút, API dùng để 403.
- API `requireTeamAccess` ở `src/lib/auth/team-access.ts` đảm bảo:
  - User đã đăng nhập.
  - User là `approved` + `is_active` member của team đó.
  - Đáp ứng `minRole` nếu route yêu cầu.
- Trigger SQL `guard_team_member_role` (migration 005) là defense-in-depth: chặn UPDATE role nếu caller không phải owner/admin trong team.
