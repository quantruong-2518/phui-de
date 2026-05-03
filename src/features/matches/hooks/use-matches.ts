'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Field } from '@/features/fields/types/field.types';
import type {
  CreateEventInput,
  CreateMatchInput,
  Match,
  MatchEvent,
  MatchStatus,
  MatchWithEvents,
  UpdateMatchInput,
} from '../types/match.types';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json;
}

/** Sân catalog của trận mới nhất có `field_id`. `null` nếu chưa có. */
export function useTeamRecentField(slug: string | undefined | null) {
  return useQuery({
    queryKey: ['team-recent-field', slug ?? ''],
    enabled: !!slug,
    queryFn: async () => {
      const json = await fetchJson<{ data: Field | null }>(
        `/api/teams/${slug}/recent-field`,
      );
      return json.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useMatches(slug: string, status?: MatchStatus | 'all') {
  return useQuery({
    queryKey: ['matches', slug, status ?? 'all'],
    queryFn: async () => {
      const url = new URL(`/api/teams/${slug}/matches`, window.location.origin);
      if (status && status !== 'all') url.searchParams.set('status', status);
      const json = await fetchJson<{ data: Match[] }>(url.pathname + url.search);
      return json.data;
    },
    enabled: !!slug,
  });
}

export function useMatch(slug: string, id: string | undefined) {
  return useQuery({
    queryKey: ['matches', slug, id],
    queryFn: async () => {
      const json = await fetchJson<{ data: MatchWithEvents }>(
        `/api/teams/${slug}/matches/${id}`,
      );
      return json.data;
    },
    enabled: !!slug && !!id,
  });
}

export function useCreateMatch(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateMatchInput) => {
      const json = await fetchJson<{ data: Match }>(
        `/api/teams/${slug}/matches`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        },
      );
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches', slug] });
      qc.invalidateQueries({ queryKey: ['team-dashboard', slug] });
      toast.success('Đã tạo lịch trận');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateMatch(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; patch: UpdateMatchInput }) =>
      fetchJson(`/api/teams/${slug}/matches/${vars.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars.patch),
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['matches', slug] });
      qc.invalidateQueries({ queryKey: ['matches', slug, vars.id] });
      qc.invalidateQueries({ queryKey: ['team-dashboard', slug] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteMatch(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/teams/${slug}/matches/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches', slug] });
      qc.invalidateQueries({ queryKey: ['team-dashboard', slug] });
      toast.success('Đã xóa trận');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAddMatchEvent(slug: string, matchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      const json = await fetchJson<{ data: MatchEvent }>(
        `/api/teams/${slug}/matches/${matchId}/events`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        },
      );
      return json.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches', slug, matchId] });
      qc.invalidateQueries({ queryKey: ['players', slug] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteMatchEvent(slug: string, matchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      fetchJson(`/api/teams/${slug}/matches/${matchId}/events/${eventId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches', slug, matchId] });
      qc.invalidateQueries({ queryKey: ['players', slug] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
