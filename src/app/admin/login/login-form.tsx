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
import { createClient } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const USERNAME_TO_EMAIL: Record<string, string> = {
  admin: 'admin@phude.local',
};

const adminLoginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, 'Tên đăng nhập tối thiểu 2 ký tự')
    .max(40, 'Tên đăng nhập quá dài'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async ({ username, password }: AdminLoginInput) => {
    const u = username.trim().toLowerCase();
    const email = USERNAME_TO_EMAIL[u] ?? `${u}@phude.local`;

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profile?.role !== 'ADMIN') {
        await supabase.auth.signOut();
        toast.error('Tài khoản không có quyền admin');
        return;
      }

      toast.success('Đăng nhập thành công');
      router.push('/admin/fields');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      toast.error(/credentials/i.test(msg) ? 'Sai tên hoặc mật khẩu' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 text-primary flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold">
        <Shield className="h-4 w-4" />
        Khu vực quản trị
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên đăng nhập</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    autoComplete="username"
                    placeholder="admin"
                    autoFocus
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
                <FormLabel>Mật khẩu</FormLabel>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đăng nhập
          </Button>
        </form>
      </Form>

      <Link
        href="/login"
        className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1.5 text-sm transition-colors w-full"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Quay lại đăng nhập user
      </Link>
    </div>
  );
}
