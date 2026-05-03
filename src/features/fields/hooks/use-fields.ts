import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { Field, FieldInput } from '../types/field.types';

const KEY = ['fields'] as const;

interface ListResponse {
  data: Field[];
}

export function useFields(search?: string) {
  return useQuery({
    queryKey: [...KEY, { search: search ?? '' }],
    queryFn: () =>
      api.get<ListResponse>('/api/fields', {
        params: search ? { search } : undefined,
      }),
    select: (r) => r.data,
  });
}

export function useCreateField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FieldInput) =>
      api.post<{ data: Field }>('/api/fields', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Đã thêm sân mới');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Thêm sân thất bại';
      toast.error(msg);
    },
  });
}

export function useUpdateField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<FieldInput> }) =>
      api.patch<{ data: Field }>(`/api/fields/${id}`, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Đã cập nhật sân');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Cập nhật thất bại';
      toast.error(msg);
    },
  });
}

export function useDeleteField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/fields/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Đã xoá sân');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Xoá thất bại';
      toast.error(msg);
    },
  });
}
