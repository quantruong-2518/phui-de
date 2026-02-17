'use client';

import { useQuery } from '@tanstack/react-query';
import type { Team, DashboardStats } from '../types/team.types';

interface DashboardData extends DashboardStats {
  team: Team;
  recentMatches: unknown[];
  topScorers: unknown[];
}

async function getDashboard(slug: string) {
  const res = await fetch(`/api/teams/${slug}/dashboard`);
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard');
  }
  const json = await res.json();
  return json.data as DashboardData;
}

export function useTeamDashboard(slug: string) {
  return useQuery({
    queryKey: ['team-dashboard', slug],
    queryFn: () => getDashboard(slug),
    enabled: !!slug,
  });
}
