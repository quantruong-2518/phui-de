'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, Calendar, User, Trophy } from 'lucide-react';
import { useOnboarding } from '@/hooks/use-onboarding';

const navItems = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/matches', label: 'Trận đấu', icon: Zap },
  { href: '/bookings', label: 'Đặt sân', icon: Calendar },
  { href: '/profile', label: 'Cá nhân', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data } = useOnboarding();

  return (
    <aside className="border-border bg-background sticky top-0 hidden h-screen w-60 flex-col border-r md:flex">
      {/* Logo */}
      <div className="border-border border-b p-6">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-primary">PHỦI</span> ĐÊ
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              } `}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Team info (if user is in a team) */}
      {data?.team && (
        <div className="border-border border-t p-4">
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Trophy className="text-primary h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {data.team.name}
                </div>
                <div className="text-muted-foreground text-xs">
                  {data.role.icon} {data.role.label}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
