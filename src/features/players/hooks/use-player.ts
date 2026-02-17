'use client';

import { useQuery } from '@tanstack/react-query';
import type { Player } from '@/features/players/types/player.types';

async function getPlayer(slug: string, id: string) {
  const res = await fetch(`/api/teams/${slug}/players/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch player');
  }
  const json = await res.json();
  return json.data as Player;
}

export function usePlayer(slug: string, id: string) {
  return useQuery({
    queryKey: ['player', slug, id],
    queryFn: () => getPlayer(slug, id),
    enabled: !!slug && !!id,
  });
}
