'use client';

import {
  Shield,
  TrendingUp,
  Zap,
  Trophy,
  BarChart3,
  History,
  Crown,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { MOCK_PASSION_FC } from '@/lib/mock-data';

const badgeIcons: Record<string, React.ElementType> = {
  shield: Shield,
  trend: TrendingUp,
  zap: Zap,
  award: Trophy,
};

// Team specific navigation items
const teamNavItems = [
  {
    segment: 'dashboard',
    label: 'Tổng quan',
    icon: BarChart3,
  },
  {
    segment: 'matches',
    label: 'Lịch sử',
    icon: History,
  },
  {
    segment: 'squad',
    label: 'Thành viên',
    icon: Crown,
  },
  {
    segment: 'settings',
    label: 'Cài đặt',
    icon: Settings,
  },
];

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const teamId = (params?.id as string) || 'default';
  const team = MOCK_PASSION_FC; // In real app, fetch team by teamId

  // Use params directly in JSX to support Next.js 13+ strict layout contracts
  // But params is passed as a promise in Next.js 15? Or plain object?
  // In app directory `layout.tsx` for `[id]`, `params` is available synchronously in many versions.
  // We'll trust the current project setup (Next 14/15 likely plain object or use hook).
  // Actually, to be safe with `next/navigation`, client components should use `useSelectedLayoutSegments` or similar,
  // but `params` prop is standard.

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 pb-20 sm:p-6 lg:p-8">
      {/* ===== Team Header ("Card lẹm canvas") ===== */}
      <div className="card-featured relative overflow-hidden rounded-[20px] p-5 md:p-6">
        {/* Abstract decorative shape */}
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-1/3 -translate-y-1/3 rotate-45 transform bg-white/5 blur-3xl transition-transform duration-500 hover:scale-110" />
        <div className="bg-primary/20 absolute bottom-0 left-0 h-40 w-40 -translate-x-1/3 translate-y-1/3 rotate-12 transform blur-3xl transition-transform duration-500 hover:scale-110" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {/* Logo box */}
            <div className="from-primary to-primary/80 shadow-primary/20 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ring-1 ring-white/10">
              <Shield className="text-primary-foreground h-8 w-8" />
            </div>

            {/* Title & Badges */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {team.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                {team.badges?.map((badge: any) => {
                  const Icon = badgeIcons[badge.icon] || Shield;
                  return (
                    <span
                      key={badge.id}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md transition-colors hover:bg-white/20 ${badge.color}`}
                    >
                      <Icon className="h-3 w-3" />
                      {badge.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 scrollbar-hide flex overflow-x-auto rounded-xl p-1">
        {teamNavItems.map((item) => {
          const href = `/teams/${teamId}/${item.segment}`;
          const isActive = pathname.includes(item.segment);
          const Icon = item.icon;

          return (
            <Link
              key={item.segment}
              href={href}
              className={`flex min-w-[100px] flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                isActive
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

      {/* ===== Page Content ===== */}
      <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
        {children}
      </div>
    </div>
  );
}
