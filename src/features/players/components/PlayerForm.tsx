'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useCreatePlayer } from '../hooks/use-players';
import {
  createPlayerSchema,
  type CreatePlayerSchema,
} from '../validations/player-schemas';
import { Loader2 } from 'lucide-react';

export function PlayerForm({
  slug,
  onCreated,
}: {
  slug: string;
  onCreated?: () => void;
}) {
  const { mutate, isPending } = useCreatePlayer(slug);

  const form = useForm<CreatePlayerSchema>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: { name: '', code: '', position: 'MF' },
  });

  function onSubmit(data: CreatePlayerSchema) {
    mutate(data, {
      onSuccess: () => {
        form.reset({ name: '', code: '', position: 'MF' });
        onCreated?.();
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên cầu thủ</FormLabel>
              <FormControl>
                <Input placeholder="Nguyễn Văn A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số áo</FormLabel>
                <FormControl>
                  <Input placeholder="10" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Duy nhất trong đội.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vị trí</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GK">Thủ môn</SelectItem>
                    <SelectItem value="DF">Hậu vệ</SelectItem>
                    <SelectItem value="MF">Tiền vệ</SelectItem>
                    <SelectItem value="FW">Tiền đạo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Thêm cầu thủ
        </Button>
      </form>
    </Form>
  );
}
