'use client';

import { useOnboarding } from '@/hooks/use-onboarding';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Sidebar } from '@/components/navigation/Sidebar';
import { TeamOverview } from '@/components/home/TeamOverview';
import { UpcomingEvents } from '@/components/home/UpcomingEvents';
import { ActivityFeed } from '@/components/home/ActivityFeed';
import { Trophy, Zap, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isOnboarded, data } = useOnboarding();

  if (!isOnboarded) {
    return <OnboardingModal />;
  }

  // Get team slug from data (or use default)
  const teamSlug = data?.team?.code?.toLowerCase() || 'my-team';

  return (
    <div className="bg-background flex min-h-screen">
      <Sidebar />

      <main className="flex-1 pb-16 md:pb-0">
        <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
          {/* Team Overview */}
          {data?.team && data?.role && (
            <TeamOverview
              team={data.team}
              role={data.role}
              approval={data.approval}
              memberName={data.name}
            />
          )}

          {/* Quick Actions */}
          <div className="space-y-2">
            <h2 className="text-base font-semibold">Quản lý nhanh</h2>

            <div className="grid grid-cols-2 gap-2">
              {/* Team Management */}
              <Link
                href={`/teams/${teamSlug}/dashboard`}
                className="group from-primary/10 hover:border-primary rounded-lg border bg-gradient-to-br to-transparent p-3 transition-all hover:shadow-sm"
              >
                <div className="space-y-2">
                  <div className="bg-primary/10 group-hover:bg-primary flex h-9 w-9 items-center justify-center rounded-lg transition-all group-hover:scale-105">
                    <Trophy className="text-primary group-hover:text-primary-foreground h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="group-hover:text-primary text-sm font-semibold transition-colors">
                      Dashboard
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Tổng quan đội bóng
                    </p>
                  </div>
                </div>
              </Link>

              {/* Players */}
              <Link
                href={`/teams/${teamSlug}/players`}
                className="group from-primary/10 hover:border-primary rounded-lg border bg-gradient-to-br to-transparent p-3 transition-all hover:shadow-sm"
              >
                <div className="space-y-2">
                  <div className="bg-primary/10 group-hover:bg-primary flex h-9 w-9 items-center justify-center rounded-lg transition-all group-hover:scale-105">
                    <Users className="text-primary group-hover:text-primary-foreground h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="group-hover:text-primary text-sm font-semibold transition-colors">
                      Cầu thủ
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Quản lý thành viên
                    </p>
                  </div>
                </div>
              </Link>

              {/* Matches */}
              <Link
                href="/matches"
                className="group from-accent/10 hover:border-accent rounded-lg border bg-gradient-to-br to-transparent p-3 transition-all hover:shadow-sm"
              >
                <div className="space-y-2">
                  <div className="bg-accent/10 group-hover:bg-accent flex h-9 w-9 items-center justify-center rounded-lg transition-all group-hover:scale-105">
                    <Zap className="text-accent group-hover:text-accent-foreground h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="group-hover:text-accent text-sm font-semibold transition-colors">
                      Tìm trận
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Cáp kèo nhanh
                    </p>
                  </div>
                </div>
              </Link>

              {/* Bookings */}
              <Link
                href="/bookings"
                className="group from-primary/10 hover:border-primary rounded-lg border bg-gradient-to-br to-transparent p-3 transition-all hover:shadow-sm"
              >
                <div className="space-y-2">
                  <div className="bg-primary/10 group-hover:bg-primary flex h-9 w-9 items-center justify-center rounded-lg transition-all group-hover:scale-105">
                    <Calendar className="text-primary group-hover:text-primary-foreground h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="group-hover:text-primary text-sm font-semibold transition-colors">
                      Đặt sân
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Tìm sân gần bạn
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-2">
            <h2 className="text-base font-semibold">Sự kiện sắp tới</h2>
            <UpcomingEvents />
          </div>

          {/* Recent Activity */}
          <div className="space-y-2">
            <h2 className="text-base font-semibold">Hoạt động gần đây</h2>
            <ActivityFeed />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
