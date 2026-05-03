import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MapPinned, LogOut } from 'lucide-react';
import { AdminLogoutButton } from './logout-button';

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
      <header className="bg-card sticky top-0 z-30 shadow-sm">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-1">
            <Link
              href="/admin/fields"
              className="text-foreground hover:text-primary px-2 py-1 text-sm font-bold tracking-tight transition-colors"
            >
              Admin Phủ Đê
            </Link>
            <span className="text-muted-foreground/50 mx-1">·</span>
            <Link
              href="/admin/fields"
              className="hover:bg-muted/50 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors"
            >
              <MapPinned className="h-4 w-4" />
              Sân bãi
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground hidden text-xs sm:inline">
              {profile?.name ?? 'Admin'}
            </span>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
