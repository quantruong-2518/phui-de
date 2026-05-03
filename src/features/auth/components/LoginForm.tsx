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
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/use-auth';
import { loginSchema, type LoginInput } from '../validations/auth-schemas';

export function LoginForm() {
  const { login, isLoading } = useAuth();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(login)} className="space-y-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    inputMode="tel"
                    placeholder="09xx xxx xxx"
                    autoComplete="tel"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Mật khẩu</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>
      </Form>

      <div className="text-muted-foreground text-center text-sm">
        Chưa có tài khoản?{' '}
        <Link
          href="/register"
          className="text-primary font-semibold hover:underline"
        >
          Đăng ký ngay
        </Link>
      </div>

      <div className="text-center">
        <Link
          href="/admin/login"
          className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
        >
          Đăng nhập admin
        </Link>
      </div>
    </div>
  );
}
