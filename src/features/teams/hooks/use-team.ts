'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Team } from '../types/team.types';

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
