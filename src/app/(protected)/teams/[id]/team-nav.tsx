'use client';

import {
  BarChart3,
  Calendar,
  History,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  segment: string;
  label: string;
  icon: LucideIcon;
  /** External href (does not depend on team slug). */
  externalHref?: string;
  /** If true, render as a raised pill in the center on mobile. */
  highlight?: boolean;
};

const teamNavItems: NavItem[] = [
  { segment: 'dashboard', label: 'Tổng quan', icon: BarChart3 },
  { segment: 'matches', label: 'Trận đấu', icon: History },
  {
    segment: 'bookings',
    label: 'Đặt sân',
    icon: Calendar,
    externalHref: '/bookings',
    highlight: true,
  },
  { segment: 'members', label: 'Thành viên', icon: Users },
  { segment: 'settings', label: 'Quản lý', icon: Settings },
];

export function TeamNav({ slug }: { slug: string }) {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    item.externalHref
      ? pathname.startsWith(item.externalHref)
      : pathname.includes(`/${item.segment}`);

  const hrefOf = (item: NavItem) =>
    item.externalHref ?? `/teams/${slug}/${item.segment}`;

  return (
    <>
      {/* Desktop / tablet: inline tab bar */}
      <div className="bg-muted/50 hidden gap-1 rounded-xl p-1 md:flex">
        {teamNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.segment}
              href={hrefOf(item)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                active
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Mobile: floating bottom bar — bo, shadow, gradient nhẹ */}
      <nav
        className="fixed inset-x-3 bottom-3 z-40 md:hidden"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="from-primary/10 via-card to-card supports-[backdrop-filter]:bg-card/85 grid h-16 grid-cols-5 items-end overflow-hidden rounded-3xl bg-gradient-to-br shadow-[0_12px_40px_-10px_rgba(0,0,0,0.35)] backdrop-blur">
          {teamNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            if (item.highlight) {
              return (
                <Link
                  key={item.segment}
                  href={hrefOf(item)}
                  className="relative flex h-full flex-col items-center justify-end pb-1.5"
                  aria-label={item.label}
                >
                  <span
                    className={`from-primary to-primary/80 absolute -top-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br shadow-lg shadow-primary/40 transition-transform active:scale-95 ${
                      active ? 'scale-105' : ''
                    }`}
                  >
                    <Icon className="text-primary-foreground h-5 w-5" />
                  </span>
                  <span
                    className={`mt-7 text-[10px] font-semibold ${
                      active ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.segment}
                href={hrefOf(item)}
                className={`flex h-full flex-col items-center justify-center gap-1 transition-colors ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label={item.label}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
