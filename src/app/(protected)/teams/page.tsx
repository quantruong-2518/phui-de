'use client';

import { Button } from '@/components/ui/button';
import { TeamCard } from '@/features/teams/components/TeamCard';
import { useTeams } from '@/features/teams/hooks/use-teams';
import { Loader2, Plus, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function TeamsPage() {
  const { data: teams, isLoading, error } = useTeams();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive flex h-[50vh] items-center justify-center font-medium">
        Error loading teams
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            ĐỘI BÓNG CỦA TÔI
          </h1>
          <p className="text-muted-foreground text-sm">
            Quản lý và điều hành các đội bóng bạn tham gia.
          </p>
        </div>
        <Link href="/teams/new">
          <Button className="h-10 rounded-md px-4 text-sm font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Tạo đội mới
          </Button>
        </Link>
      </div>

      {teams && teams.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        /* Empty State - Minimalist */
        <div className="animate-in fade-in-50 flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-muted/30 mb-6 rounded-full p-4">
            <ShieldAlert className="text-muted-foreground h-12 w-12 stroke-[1.5]" />
          </div>
          <h3 className="mb-2 text-xl font-semibold tracking-tight">
            Chưa tham gia đội bóng nào
          </h3>
          <p className="text-muted-foreground mb-8 max-w-sm text-sm leading-relaxed">
            Bạn chưa tham gia hoặc quản lý đội bóng nào. Hãy tạo đội mới để bắt
            đầu hành trình phủi của mình.
          </p>
          <Link href="/teams/new">
            <Button size="lg" className="h-12 px-8">
              Tạo đội ngay
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
