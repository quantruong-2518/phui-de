'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Player, UpdatePlayerInput } from '../types/player.types';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json;
}

export function usePlayers(slug: string) {
  return useQuery({
    queryKey: ['players', slug],
    queryFn: async () => {
      const json = await fetchJson<{ data: Player[] }>(
        `/api/teams/${slug}/players`,
      );
      return json.data;
    },
    enabled: !!slug,
  });
}

export function usePlayer(slug: string, id: string | undefined) {
  return useQuery({
    queryKey: ['players', slug, id],
    queryFn: async () => {
      const json = await fetchJson<{ data: Player }>(
        `/api/teams/${slug}/players/${id}`,
      );
      return json.data;
    },
    enabled: !!slug && !!id,
  });
}

export function useUpdatePlayer(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: UpdatePlayerInput }) =>
      fetchJson(`/api/teams/${slug}/players/${vars.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars.patch),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['players', slug] });
      qc.invalidateQueries({ queryKey: ['members', slug] });
      qc.invalidateQueries({ queryKey: ['team-dashboard', slug] });
      toast.success('Đã cập nhật');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeletePlayer(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/teams/${slug}/players/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['players', slug] });
      qc.invalidateQueries({ queryKey: ['members', slug] });
      qc.invalidateQueries({ queryKey: ['team-dashboard', slug] });
      toast.success('Đã xóa khỏi đội');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
