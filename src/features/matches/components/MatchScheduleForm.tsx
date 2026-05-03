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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFields } from '@/features/fields/hooks/use-fields';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateMatch } from '../hooks/use-matches';

const OTHER = '__other__';
const NONE = '__none__';

const schema = z.object({
  opponent: z.string().trim().min(1, 'Bắt buộc').max(80),
  match_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày YYYY-MM-DD'),
  match_time: z.string().regex(/^\d{2}:\d{2}$/, 'Giờ HH:MM'),
  field_choice: z.string(),
  field_text: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
});

type Schema = z.infer<typeof schema>;

export function MatchScheduleForm({
  slug,
  defaultFieldId,
  onCreated,
}: {
  slug: string;
  /** Prefill dropdown sân (vd. khi đến từ /bookings). */
  defaultFieldId?: string;
  onCreated?: (id: string) => void;
}) {
  const { mutate, isPending } = useCreateMatch(slug);
  const { data: fields = [], isLoading: fieldsLoading } = useFields();
  const today = new Date().toISOString().slice(0, 10);

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      opponent: '',
      match_date: today,
      match_time: '19:00',
      field_choice: defaultFieldId ?? NONE,
      field_text: '',
      notes: '',
    },
  });

  // Khi fields load xong & defaultFieldId có nhưng chưa set (vd. fields chưa
  // sẵn lúc mount) — sync lại.
  useEffect(() => {
    if (defaultFieldId && fields.some((f) => f.id === defaultFieldId)) {
      form.setValue('field_choice', defaultFieldId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFieldId, fields.length]);

  const fieldChoice = form.watch('field_choice');
  const showTextInput = fieldChoice === OTHER;

  function onSubmit(data: Schema) {
    const isCatalog = data.field_choice !== NONE && data.field_choice !== OTHER;
    mutate(
      {
        opponent: data.opponent,
        match_date: data.match_date,
        match_time: data.match_time,
        field_id: isCatalog ? data.field_choice : null,
        field: isCatalog
          ? null
          : data.field_choice === OTHER && data.field_text
            ? data.field_text
            : null,
        notes: data.notes || null,
      },
      {
        onSuccess: (m) => {
          form.reset({
            opponent: '',
            match_date: today,
            match_time: '19:00',
            field_choice: NONE,
            field_text: '',
            notes: '',
          });
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
        <div className="grid grid-cols-3 gap-3">
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
            name="match_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giờ</FormLabel>
                <FormControl>
                  <Input type="time" step={300} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="field_choice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sân</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={fieldsLoading}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn sân" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>— Chưa chọn —</SelectItem>
                    {fields.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                    <SelectItem value={OTHER}>Sân khác (nhập tay)…</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {showTextInput && (
          <FormField
            control={form.control}
            name="field_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên sân (tự nhập)</FormLabel>
                <FormControl>
                  <Input placeholder="Sân Mỹ Đình" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
