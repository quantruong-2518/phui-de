export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';

export interface Player {
  id: string;
  team_id: string;
  name: string;
  code: string | null;
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

export interface CreatePlayerInput {
  name: string;
  code?: string;
  position?: PlayerPosition;
  avatar_url?: string;
}

export interface UpdatePlayerInput {
  name?: string;
  code?: string | null;
  position?: PlayerPosition | null;
  avatar_url?: string | null;
}

export const POSITION_LABEL: Record<PlayerPosition, string> = {
  GK: 'Thủ môn',
  DF: 'Hậu vệ',
  MF: 'Tiền vệ',
  FW: 'Tiền đạo',
};
