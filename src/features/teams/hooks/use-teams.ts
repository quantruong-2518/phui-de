import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Team } from '../types/team.types';

interface TeamsResponse {
  data: (Team & { member_count: number })[];
}

async function getTeams(search?: string) {
  const params: Record<string, string> = {};
  if (search) {
    params.search = search;
  }
  return api.get<TeamsResponse>('/teams', { params });
}

export function useTeams(search?: string) {
  return useQuery({
    queryKey: ['teams', search],
    queryFn: async () => {
      const response = await getTeams(search);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
