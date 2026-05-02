'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type MemberRole = 'owner' | 'admin' | 'member';

export interface TeamMember {
  id: string;
  user_id: string;
  role: MemberRole;
  team_role_id: string | null;
  team_role_label: string | null;
  approval_status: ApprovalStatus;
  requested_at: string;
  approved_at: string | null;
  joined_at: string;
  user: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json;
}

export function useTeamMembers(slug: string, status?: ApprovalStatus) {
  return useQuery({
    queryKey: ['members', slug, status ?? 'all'],
    queryFn: async () => {
      const url = new URL(
        `/api/teams/${slug}/members`,
        window.location.origin,
      );
      if (status) url.searchParams.set('status', status);
      const json = await fetchJson<{ data: TeamMember[] }>(url.pathname + url.search);
      return json.data;
    },
    enabled: !!slug,
  });
}

interface UpdateMemberInput {
  approval_status?: 'approved' | 'rejected';
  role?: 'admin' | 'member';
  team_role_id?: string;
  team_role_label?: string;
}

export function useUpdateMember(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { memberId: string; patch: UpdateMemberInput }) =>
      fetchJson(`/api/teams/${slug}/members/${vars.memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars.patch),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', slug] });
      toast.success('Đã cập nhật');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRemoveMember(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      fetchJson(`/api/teams/${slug}/members/${memberId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', slug] });
      toast.success('Đã xóa thành viên');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
