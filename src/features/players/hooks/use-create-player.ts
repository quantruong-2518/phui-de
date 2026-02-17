'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { CreatePlayerSchema } from '@/features/players/validations/player-schemas';

export function useCreatePlayer(slug: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreatePlayerSchema) => {
      const res = await fetch(`/api/teams/${slug}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create player');
      }

      return res.json();
    },
    onSuccess: () => {
      toast.success('Thêm cầu thủ thành công');
      queryClient.invalidateQueries({ queryKey: ['players', slug] });
      router.push(`/teams/${slug}/players`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
