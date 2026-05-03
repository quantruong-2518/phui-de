import { AdminHeader } from '@/components/navigation/AdminHeader';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  return (
    <div className="bg-muted/20 min-h-screen">
      <AdminHeader adminName={profile?.name ?? 'Admin'} />
      <main className="mx-auto w-full max-w-5xl space-y-4 p-3 sm:space-y-6 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
