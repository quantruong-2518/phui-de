import { useQuery } from '@tanstack/react-query';
import type { Team } from '../types/team.types';
import { MOCK_TEAMS } from '@/lib/mock-data';

async function getTeams() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Return mock data cast as Team[]
  // Note: MOCK_TEAMS might need some adjustments to match Team interface perfectly if strict type checking is on,
  // but for now we cast it to keep it simple.
  return MOCK_TEAMS as unknown as Team[];
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  });
}
