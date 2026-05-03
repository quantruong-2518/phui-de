import { AuthLayout } from '@/features/auth';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminLoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Đăng nhập Admin',
};

export default async function AdminLoginPage() {
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
    <AuthLayout
      title="Quản trị Phủ Đê"
      subtitle="Khu admin — chỉ tài khoản quản trị"
    >
      <AdminLoginForm />
    </AuthLayout>
  );
}
