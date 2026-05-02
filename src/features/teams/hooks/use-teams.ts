import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { Team } from '../types/team.types';

export type TeamsScope = 'mine' | 'all';

export interface TeamsPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface TeamsApiResponse {
  data: (Team & { member_count: number })[];
  pagination: TeamsPagination;
}

export interface UseTeamsOptions {
  scope?: TeamsScope;
  search?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

async function getTeams(opts: UseTeamsOptions) {
  const params: Record<string, string> = {
    scope: opts.scope ?? 'mine',
  };
  if (opts.search) params.search = opts.search;
  if (opts.page) params.page = String(opts.page);
  if (opts.pageSize) params.pageSize = String(opts.pageSize);
  return api.get<TeamsApiResponse>('/api/teams', { params });
}

export function useTeams(opts: UseTeamsOptions = {}) {
  const scope = opts.scope ?? 'mine';
  const search = opts.search ?? '';
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 12;

  return useQuery({
    queryKey: ['teams', scope, search, page, pageSize],
    queryFn: () => getTeams({ ...opts, scope, search, page, pageSize }),
    staleTime: 30 * 1000,
    enabled: opts.enabled ?? true,
    placeholderData: (prev) => prev,
  });
}

export function useJoinTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) =>
      api.post<{ success: boolean; status: 'pending' }>(
        `/api/teams/${slug}/join`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Đã gửi yêu cầu, chờ đội trưởng duyệt.');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || 'Không gửi được yêu cầu.';
      toast.error(msg);
    },
  });
}
