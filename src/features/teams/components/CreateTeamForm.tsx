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
import { useCreateTeam } from '../hooks/use-create-team';
import {
  createTeamSchema,
  type CreateTeamSchema,
} from '../validations/team-schemas';

export function CreateTeamForm() {
  const { mutate: createTeam, isPending } = useCreateTeam();

  const form = useForm<CreateTeamSchema>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      primary_color: '#22c55e',
      secondary_color: '#ffffff',
    },
  });

  const onSubmit = (data: CreateTeamSchema) => {
    createTeam(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên đội bóng</FormLabel>
              <FormControl>
                <Input placeholder="Ví dụ: Passion FC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="primary_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Màu áo chính</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input type="color" className="w-12 p-1" {...field} />
                  </FormControl>
                  <Input {...field} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="secondary_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Màu áo phụ</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input type="color" className="w-12 p-1" {...field} />
                  </FormControl>
                  <Input {...field} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Tạo đội bóng
        </Button>
      </form>
    </Form>
  );
}
