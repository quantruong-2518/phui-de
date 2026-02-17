'use client';

import { useQuery } from '@tanstack/react-query';
import type { Player } from '@/features/players/types/player.types';

async function getPlayers(slug: string) {
  const res = await fetch(`/api/teams/${slug}/players`);
  if (!res.ok) {
    throw new Error('Failed to fetch players');
  }
  const json = await res.json();
  return json.data as Player[];
}

export function usePlayers(slug: string) {
  return useQuery({
    queryKey: ['players', slug],
    queryFn: () => getPlayers(slug),
    enabled: !!slug,
  });
}
