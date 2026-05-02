/**
 * Pure helpers cho phân quyền trong 1 đội. Dùng cả ở UI (gating button) và
 * API (enforce server-side). Single source of truth — đổi 1 chỗ là cả app
 * theo. Xem thêm `docs/permissions.md`.
 */

import type { TeamMemberRole } from './team-access';

export type Action =
  | 'approveRequest' // duyệt / từ chối yêu cầu tham gia
  | 'editSquad' // sửa số áo / vị trí
  | 'kick' // xoá khỏi đội
  | 'deactivate' // dừng / mở lại hoạt động
  | 'changeRole'; // cấp / thu hồi quyền đội phó

interface Ctx {
  /** Vai trò của user đang thực hiện thao tác. */
  viewer: TeamMemberRole;
  /** Vai trò của target (member bị thao tác). Optional cho action không có target. */
  target?: TeamMemberRole;
  /** True nếu viewer đang thao tác lên chính bản thân mình. */
  isSelf?: boolean;
}

const RANK: Record<TeamMemberRole, number> = {
  member: 1,
  admin: 2,
  owner: 3,
};

export function can(action: Action, ctx: Ctx): boolean {
  const { viewer, target, isSelf } = ctx;

  switch (action) {
    case 'approveRequest':
      // Owner + Admin (đội trưởng + đội phó)
      return RANK[viewer] >= RANK['admin'];

    case 'editSquad':
      return RANK[viewer] >= RANK['admin'];

    case 'changeRole':
      // Chỉ owner (đội trưởng)
      return viewer === 'owner';

    case 'kick':
    case 'deactivate': {
      // User được tự rời đội (chỉ áp dụng cho 'kick')
      if (action === 'kick' && isSelf && target !== 'owner') return true;
      // Không bao giờ chạm vào owner
      if (target === 'owner') return false;
      // Owner: kick/deactivate được mọi người (không phải owner)
      if (viewer === 'owner') return true;
      // Admin: chỉ thao tác với member, không thao tác với admin khác
      if (viewer === 'admin') return target === 'member';
      return false;
    }
  }
}
