export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';

/**
 * Player = squad-row view of a `team_members` record. Stats và config gameplay
 * (jersey, position) gắn với cặp user×team. `name` / `avatar_url` đến từ user
 * liên kết, không còn lưu trên row riêng.
 */
export interface Player {
  id: string; // team_members.id
  name: string;
  code: string | null; // jersey number
  position: PlayerPosition | null;
  avatar_url: string | null;
  matches_played: number;
  goals: number;
  assists: number;
  clean_sheets: number;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface UpdatePlayerInput {
  code?: string | null;
  position?: PlayerPosition | null;
}

export const POSITION_LABEL: Record<PlayerPosition, string> = {
  GK: 'Thủ môn',
  DF: 'Hậu vệ',
  MF: 'Tiền vệ',
  FW: 'Tiền đạo',
};
