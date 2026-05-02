'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Team } from '../types/team.types';

interface DashboardStats {
  totalPlayers: number;
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  winRate: number;
  totalPoints: number;
}

interface DashboardData {
  team: { id: string; slug: string; name: string };
  season: { id: string; year: number; name: string } | null;
  stats: DashboardStats;
  recentMatches: Array<{
    id: string;
    opponent: string;
    match_date: string;
    result: 'W' | 'L' | 'D' | null;
    goals_scored: number;
    goals_conceded: number;
    status: string;
  }>;
  topScorers: Array<{
    id: string;
    name: string;
    code: string | null;
    position: string | null;
    goals: number;
    assists: number;
    total_points: number;
  }>;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}

export function useTeam(slug: string | undefined) {
  return useQuery({
    queryKey: ['team', slug],
    queryFn: async () => {
      const json = await fetchJson<{ data: Team & { member_count: number } }>(
        `/api/teams/${slug}`,
      );
      return json.data;
    },
    enabled: !!slug,
  });
}

export function useTeamDashboard(slug: string | undefined) {
  return useQuery({
    queryKey: ['team-dashboard', slug],
    queryFn: async () => {
      const json = await fetchJson<{ data: DashboardData }>(
        `/api/teams/${slug}/dashboard`,
      );
      return json.data;
    },
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });
}

interface UpdateTeamInput {
  name?: string;
  slug?: string;
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string | null;
}

export function useUpdateTeam(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateTeamInput) =>
      fetchJson(`/api/teams/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team', slug] });
      qc.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Đã cập nhật đội');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
