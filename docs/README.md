# Phủ Đê — Spec Index

Mở folder `docs/` này trong **Obsidian** để duyệt theo wikilink. Các trang dùng cú pháp `[[file-name]]` để liên kết chéo.

## Bắt đầu từ đâu

- [[architecture|Kiến trúc tổng quan]] — folder layout, layer responsibilities, conventions
- [[conventions|Coding conventions]] — naming, validation, error format
- [[database/schema|Database schema]] — bảng + quan hệ + index

## Module spec

Mỗi module có 1 spec mô tả: **mục đích**, **bảng**, **API**, **invariant**, **failure modes**, **frontend touchpoints**.

- [[modules/auth|Auth]] — đăng ký / đăng nhập / Supabase session
- [[modules/onboarding|Onboarding]] — flow 2-step, atomic completion
- [[modules/users|Users]] — profile, avatar, current user
- [[modules/teams|Teams]] — CRUD đội, slug, search, atomic creation qua RPC
- [[modules/members|Members]] — quản lý thành viên đội + approval
- [[modules/players|Players]] — squad CRUD + auto stats
- [[modules/matches|Matches]] — lịch trận + live scoring + season aggregation

## Database

- [[database/schema|Schema]] — bảng + cột + constraint
- [[database/rls|RLS policies]] — quyền truy cập từng bảng
- [[database/rpcs|RPC functions]] — `create_team_with_owner`, triggers
- [[database/migrations|Migration log]] — thứ tự apply

## Quick reference — API endpoints

| Method | Path | Auth | Note |
|--------|------|------|------|
| GET | `/api/users/me` | required | Profile + email của user hiện tại |
| PATCH | `/api/users/me` | required | Update name/phone/avatar |
| GET | `/api/onboarding` | required | Trạng thái onboarding |
| PATCH | `/api/onboarding` | required | Save profile dở (step 1) |
| POST | `/api/onboarding` | required | Finalize onboarding (set `onboarding_completed=true`) |
| GET | `/api/teams?scope=mine\|all` | required | List đội (mặc định `mine`) |
| POST | `/api/teams` | required | Atomic create team qua RPC |
| GET | `/api/teams/search?q=&page=` | optional | Search public, paginate |
| GET | `/api/teams/[slug]` | optional | Detail đội |
| PATCH | `/api/teams/[slug]` | owner | Edit team info |
| GET | `/api/teams/[slug]/dashboard` | member | Stats + recent matches + top scorers |
| GET | `/api/teams/[slug]/members?status=` | member | List members |
| PATCH | `/api/teams/[slug]/members/[memberId]` | admin | Approve / change role |
| DELETE | `/api/teams/[slug]/members/[memberId]` | admin or self | Remove (không xóa được owner) |
| GET | `/api/teams/[slug]/players` | optional | Squad |
| POST | `/api/teams/[slug]/players` | admin | Thêm cầu thủ |
| GET | `/api/teams/[slug]/players/[id]` | optional | Detail cầu thủ |
| PATCH | `/api/teams/[slug]/players/[id]` | admin | Edit cầu thủ |
| DELETE | `/api/teams/[slug]/players/[id]` | admin | Xóa cầu thủ |
| GET | `/api/teams/[slug]/matches?status=&limit=` | optional | List trận đấu |
| POST | `/api/teams/[slug]/matches` | member | Tạo lịch trận |
| GET | `/api/teams/[slug]/matches/[id]` | optional | Detail + events |
| PATCH | `/api/teams/[slug]/matches/[id]` | member | Update score/status |
| DELETE | `/api/teams/[slug]/matches/[id]` | admin | Xóa trận |
| POST | `/api/teams/[slug]/matches/[id]/events` | member | Ghi goal/assist/clean_sheet |
| DELETE | `/api/teams/[slug]/matches/[id]/events/[eventId]` | member | Undo event |

## Cập nhật doc

Sửa code → **cập nhật module spec ngay** trong cùng PR. Spec sai còn nguy hiểm hơn không có spec.
