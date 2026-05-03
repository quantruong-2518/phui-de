'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { LogOut, MapPinned, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ComponentType } from 'react';

type AdminNavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const adminNavItems: AdminNavItem[] = [
  { href: '/admin/fields', label: 'Sân bãi', icon: MapPinned },
  // Tương lai: Duyệt đội, Khuyến mãi, Booking…
];

export function AdminHeader({ adminName }: { adminName?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header className="bg-background sticky top-0 z-40 shadow-sm">
      {/* Dải báo "khu admin" — mỏng, đủ visual cue */}
      <div className="bg-amber-500/80 h-0.5 w-full" />

      <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between gap-3 px-3 sm:h-14 sm:px-6 lg:px-8">
        {/* Trái: logo + badge ADMIN + nav */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-6">
          <Link
            href="/admin/fields"
            className="flex shrink-0 items-center gap-1.5 text-base font-bold tracking-tight sm:text-lg"
          >
            <span className="text-primary">PHỦI</span>
            <span>ĐÊ</span>
            <span className="bg-amber-500/15 text-amber-600 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold">
              <ShieldAlert className="h-3 w-3" />
              ADMIN
            </span>
          </Link>

          {adminNavItems.length > 1 && (
            <nav className="hidden items-center gap-1 md:flex">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Phải: tên admin (sm+) + logout */}
        <div className="flex shrink-0 items-center gap-2">
          {adminName && (
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {adminName}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={busy}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Đăng xuất"
          >
            <LogOut className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
