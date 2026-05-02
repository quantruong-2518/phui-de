import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Team } from '../types/team.types';

export type TeamsScope = 'mine' | 'all';

interface TeamsApiResponse {
  data: (Team & { member_count: number })[];
}

async function getTeams(scope: TeamsScope, search?: string) {
  const params: Record<string, string> = { scope };
  if (search) params.search = search;
  return api.get<TeamsApiResponse>('/api/teams', { params });
}

export function useTeams(opts: { scope?: TeamsScope; search?: string } = {}) {
  const scope = opts.scope ?? 'mine';
  return useQuery({
    queryKey: ['teams', scope, opts.search ?? ''],
    queryFn: async () => {
      const response = await getTeams(scope, opts.search);
      return response?.data ?? [];
    },
    staleTime: 30 * 1000,
  });
}
