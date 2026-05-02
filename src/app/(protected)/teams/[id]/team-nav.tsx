'use client';

import { BarChart3, Crown, History, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const teamNavItems = [
  { segment: 'dashboard', label: 'Tổng quan', icon: BarChart3 },
  { segment: 'matches', label: 'Trận đấu', icon: History },
  { segment: 'members', label: 'Thành viên', icon: Users },
  { segment: 'squad', label: 'Cầu thủ', icon: Crown },
  { segment: 'settings', label: 'Cài đặt', icon: Settings },
];

export function TeamNav({ slug }: { slug: string }) {
  const pathname = usePathname();

  return (
    <div className="bg-muted/50 scrollbar-hide flex overflow-x-auto rounded-xl p-1">
      {teamNavItems.map((item) => {
        const href = `/teams/${slug}/${item.segment}`;
        const isActive = pathname.includes(`/${item.segment}`);
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
  );
}
