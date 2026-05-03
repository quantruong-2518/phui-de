'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const USERNAME_TO_EMAIL: Record<string, string> = {
  admin: 'admin@phude.local',
};

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    if (!u || !password) {
      toast.error('Nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="username">Tên đăng nhập</Label>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Đăng nhập
      </Button>
    </form>
  );
}
