import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminLoginForm } from './login-form';

export default async function AdminLoginPage() {
  // Nếu đã login với role ADMIN → vào thẳng /admin/fields.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.role === 'ADMIN') {
      redirect('/admin/fields');
    }
  }

  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4">
      <div className="bg-card w-full max-w-sm rounded-2xl p-8 shadow-md">
        <div className="mb-6 space-y-1 text-center">
          <h1 className="text-xl font-bold tracking-tight">Admin Phủ Đê</h1>
          <p className="text-muted-foreground text-xs">
            Đăng nhập tài khoản quản trị
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
