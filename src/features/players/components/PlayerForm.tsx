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
import { useCreatePlayer } from '../hooks/use-create-player';
import {
  createPlayerSchema,
  type CreatePlayerSchema,
} from '../validations/player-schemas';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function PlayerForm() {
  const params = useParams();
  const slug = params.slug as string;
  const { mutate: createPlayer, isPending } = useCreatePlayer(slug);

  const form = useForm<CreatePlayerSchema>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: {
      name: '',
      code: '',
      position: 'MID', // Default
    },
  });

  function onSubmit(data: CreatePlayerSchema) {
    createPlayer(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Tên cầu thủ</FormLabel>
                <FormControl>
                  <Input placeholder="Nguyễn Văn A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số áo / Mã</FormLabel>
                <FormControl>
                  <Input placeholder="10" {...field} />
                </FormControl>
                <FormDescription>Phải là duy nhất trong đội.</FormDescription>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vị trí" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GK">Thủ môn (GK)</SelectItem>
                    <SelectItem value="DEF">Hậu vệ (DEF)</SelectItem>
                    <SelectItem value="MID">Tiền vệ (MID)</SelectItem>
                    <SelectItem value="FWD">Tiền đạo (FWD)</SelectItem>
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
