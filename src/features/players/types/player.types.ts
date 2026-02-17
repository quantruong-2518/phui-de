export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Player {
  id: string;
  team_id: string;
  name: string;
  code: string; // Jersey number or unique ID
  position: PlayerPosition;
  avatar_url: string | null;
  matches_played: number;
  goals: number;
  assists: number;
  clean_sheets: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePlayerInput {
  name: string;
  code: string;
  position: PlayerPosition;
  avatar?: File;
}

export interface PlayerStats {
  matches: number;
  goals: number;
  assists: number;
  contribution_rate: number; // (G+A)/Matches
}
