'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, Calendar, User } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/matches', label: 'Trận', icon: Zap },
  { href: '/bookings', label: 'Sân', icon: Calendar },
  { href: '/profile', label: 'Tôi', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-background border-border fixed right-0 bottom-0 left-0 z-40 border-t md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              } `}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
