'use client';

import { Button } from '@/components/ui/button';
import { TeamCard } from '@/features/teams/components/TeamCard';
import { useTeams } from '@/features/teams/hooks/use-teams';
import type { Team } from '@/features/teams/types/team.types';
import { Compass, Loader2, Plus, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function TeamsPage() {
  const myQuery = useTeams({ scope: 'mine' });
  const allQuery = useTeams({ scope: 'all' });

  const isLoading = myQuery.isLoading || allQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  const myTeams = myQuery.data ?? [];
  const myIds = new Set(myTeams.map((t) => t.id));
  const otherTeams = (allQuery.data ?? []).filter((t) => !myIds.has(t.id));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">ĐỘI BÓNG</h1>
          <p className="text-muted-foreground text-sm">
            Quản lý đội của bạn hoặc khám phá đội khác.
          </p>
        </div>
        <Link href="/teams/create">
          <Button className="h-10 rounded-md px-4 text-sm font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Tạo đội mới
          </Button>
        </Link>
      </div>

      {/* My Teams */}
      <section className="space-y-4">
        <h2 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
          Đội của tôi
        </h2>
        {myTeams.length > 0 ? (
          <TeamGrid teams={myTeams} />
        ) : (
          <EmptyMine />
        )}
      </section>

      {/* All Teams (Discover) */}
      {otherTeams.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="text-muted-foreground h-4 w-4" />
            <h2 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Khám phá đội khác
            </h2>
          </div>
          <TeamGrid teams={otherTeams} />
        </section>
      )}
    </div>
  );
}

function TeamGrid({ teams }: { teams: (Team & { member_count: number })[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Link
          key={team.id}
          href={`/teams/${team.slug}/dashboard`}
          className="block h-full transition-transform hover:-translate-y-1"
        >
          <TeamCard team={team} />
        </Link>
      ))}
    </div>
  );
}

function EmptyMine() {
  return (
    <div className="bg-muted/30 animate-in fade-in-50 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
      <div className="bg-background mb-4 rounded-full p-4 shadow-sm">
        <ShieldAlert className="text-muted-foreground h-10 w-10 stroke-[1.5]" />
      </div>
      <h3 className="mb-1 text-base font-semibold tracking-tight">
        Chưa tham gia đội nào
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">
        Tạo đội mới hoặc xin gia nhập đội có sẵn ở phần khám phá bên dưới.
      </p>
      <Link href="/teams/create">
        <Button size="lg" className="h-11 px-6">
          Tạo đội ngay
        </Button>
      </Link>
    </div>
  );
}
