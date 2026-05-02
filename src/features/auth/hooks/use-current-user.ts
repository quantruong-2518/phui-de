'use client';

import { useQuery } from '@tanstack/react-query';

export interface CurrentUser {
  id: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string | null;
  onboarding_completed: boolean | null;
  email?: string;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const res = await fetch('/api/users/me');
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to load profile');
      return json.data as CurrentUser;
    },
    staleTime: 60 * 1000,
  });
}
