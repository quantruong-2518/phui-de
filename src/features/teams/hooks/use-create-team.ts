'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { CreateTeamInput, Team } from '../types/team.types';

async function createTeam(data: CreateTeamInput) {
  // In a real app, we'd handle file upload here (upload to storage -> get URL)
  // For now, we'll just send the text data
  const res = await fetch('/api/teams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name,
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      // logo_url: ...
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create team');
  }

  const json = await res.json();
  return json.data as Team;
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: (team) => {
      toast.success('Tạo đội bóng thành công!');
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      router.push(`/teams/${team.slug}/dashboard`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
