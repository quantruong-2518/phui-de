'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateMatch } from '../hooks/use-matches';

const schema = z.object({
  opponent: z.string().trim().min(1, 'Bắt buộc').max(80),
  match_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày YYYY-MM-DD'),
  field: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
});

type Schema = z.infer<typeof schema>;

export function MatchScheduleForm({
  slug,
  onCreated,
}: {
  slug: string;
  onCreated?: (id: string) => void;
}) {
  const { mutate, isPending } = useCreateMatch(slug);
  const today = new Date().toISOString().slice(0, 10);

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { opponent: '', match_date: today, field: '', notes: '' },
  });

  function onSubmit(data: Schema) {
    mutate(
      {
        opponent: data.opponent,
        match_date: data.match_date,
        field: data.field || null,
        notes: data.notes || null,
      },
      {
        onSuccess: (m) => {
          form.reset({ opponent: '', match_date: today, field: '', notes: '' });
          onCreated?.(m.id);
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="opponent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Đối thủ</FormLabel>
              <FormControl>
                <Input placeholder="FC Đối Thủ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="match_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="field"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sân</FormLabel>
                <FormControl>
                  <Input placeholder="Sân Mỹ Đình" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Input placeholder="Tùy chọn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Tạo lịch trận
        </Button>
      </form>
    </Form>
  );
}
