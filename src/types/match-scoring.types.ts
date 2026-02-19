// ============================================================
// Match Scoring — Types
// ============================================================

export type MatchResult = 'W' | 'D' | 'L';

export interface MatchEvent {
  id: string;
  matchId: string;
  playerId: string;
  playerName: string;
  playerCode: number; // jersey number
  type: 'goal' | 'assist';
  minute?: number;
  timestamp: string;
}

export interface MatchRecord {
  id: string;
  opponent: string;
  field: string;
  date: string;
  goalsScored: number;
  goalsConceded: number;
  result: MatchResult;
  events: MatchEvent[];
}

export interface TeamBadge {
  id: string;
  label: string;
  icon: 'award' | 'star' | 'trend' | 'zap' | 'shield';
  color: string; // hex or tailwind class
}

export interface BookedMatch {
  id: string;
  opponent: string;
  logo?: string;
  field: string;
  date: string;
  time: string;
  odds: string; // e.g. "Kèo 5-5", "Chấp 1.5"
  status: 'booked' | 'cancelled';
}

export interface GKRating {
  id: string;
  matchId: string;
  gkId: string;
  gkName: string;
  date: string;
  rating: number;
}

export interface PlayerSeason {
  id: string;
  name: string;
  code: number; // jersey number / Mã
  goals: number;
  gkPoints: number; // Điểm bắt gôn
  matchesPlayed: number;
  assists: number;
  points: number; // Điểm tổng
  supportPoints: number; // Điểm hỗ trợ
}

export interface LiveMatch {
  id: string;
  opponent: string;
  field: string;
  startTime: string;
  status: 'live' | 'ended';
  goalsScored: number;
  goalsConceded: number;
  events: MatchEvent[];
}
