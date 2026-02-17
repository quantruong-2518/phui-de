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
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '../validations/auth-schemas';

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) throw error;

      toast.success('Đã gửi link khôi phục mật khẩu vào email của bạn');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Gửi yêu cầu thất bại';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-muted-foreground text-center text-sm">
        Nhập email đã đăng ký để nhận đường dẫn đặt lại mật khẩu.
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <Link
          href="/login"
          className="text-primary font-semibold hover:underline"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
