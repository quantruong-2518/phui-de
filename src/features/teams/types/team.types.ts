export interface Team {
  id: string;
  name: string;
  slug: string;
  code: string; // Team code (e.g., TOJI001, PH001)
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  owner_id: string;
  member_count?: number; // Optional, added by API
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface CreateTeamInput {
  name: string;
  logo?: File;
  primary_color?: string;
  secondary_color?: string;
}

export interface DashboardStats {
  totalPlayers: number;
  totalMatches: number;
  winRate: number;
  goalsScored: number;
}
