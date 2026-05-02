export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'cancelled';
export type MatchResult = 'W' | 'L' | 'D';
export type MatchEventType = 'goal' | 'assist' | 'clean_sheet' | 'own_goal';

export interface Match {
  id: string;
  team_id?: string;
  season_id: string | null;
  opponent: string;
  field: string | null;
  match_date: string; // YYYY-MM-DD
  goals_scored: number;
  goals_conceded: number;
  result: MatchResult | null;
  status: MatchStatus;
  notes: string | null;
  created_at: string;
}

export interface MatchEvent {
  id: string;
  player_id: string;
  event_type: MatchEventType;
  minute: number | null;
  created_at: string;
  player?: {
    id: string;
    name: string;
    code: string | null;
    position: string | null;
  };
}

export interface MatchWithEvents extends Match {
  events: MatchEvent[];
}

export interface CreateMatchInput {
  opponent: string;
  match_date: string;
  field?: string | null;
  status?: MatchStatus;
  notes?: string | null;
}

export interface UpdateMatchInput {
  opponent?: string;
  match_date?: string;
  field?: string | null;
  status?: MatchStatus;
  goals_scored?: number;
  goals_conceded?: number;
  result?: MatchResult | null;
  notes?: string | null;
}

export interface CreateEventInput {
  player_id: string;
  event_type: MatchEventType;
  minute?: number | null;
}

export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  scheduled: 'Sắp tới',
  live: 'Đang đá',
  finished: 'Đã kết thúc',
  cancelled: 'Đã hủy',
};

export const EVENT_LABEL: Record<MatchEventType, string> = {
  goal: 'Bàn thắng',
  assist: 'Kiến tạo',
  clean_sheet: 'Sạch lưới',
  own_goal: 'Phản lưới',
};
