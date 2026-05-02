'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TeamCard } from '@/features/teams/components/TeamCard';
import {
  useJoinTeam,
  useTeams,
  type TeamsPagination,
} from '@/features/teams/hooks/use-teams';
import type { Team } from '@/features/teams/types/team.types';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Plus,
  Search,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const PAGE_SIZE = 12;

export default function TeamsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search input → committed search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const myQuery = useTeams({ scope: 'mine', pageSize: 50 });
  const allQuery = useTeams({
    scope: 'all',
    search: search.length >= 2 ? search : '',
    page,
    pageSize: PAGE_SIZE,
  });

  const myTeams = myQuery.data?.data ?? [];
  const myIds = new Set(myTeams.map((t) => t.id));
  const otherTeams = (allQuery.data?.data ?? []).filter(
    (t) => !myIds.has(t.id),
  );
  const pagination = allQuery.data?.pagination;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:space-y-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">ĐỘI BÓNG</h1>
          <p className="text-muted-foreground text-sm">
            Quản lý đội của bạn hoặc khám phá đội khác.
          </p>
        </div>
        <Link href="/teams/create">
          <Button
            size="sm"
            className="h-9 rounded-md px-3 text-sm font-medium sm:h-10 sm:px-4"
            aria-label="Tạo đội mới"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Tạo đội mới</span>
          </Button>
        </Link>
      </div>

      {/* My Teams */}
      {myQuery.isLoading ? (
        <SectionLoader />
      ) : myTeams.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
            Đội của tôi
          </h2>
          <TeamGrid teams={myTeams} />
        </section>
      ) : null}

      {/* Discover */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
            Khám phá đội khác
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Tìm theo tên hoặc mã đội"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {allQuery.isLoading ? (
          <SectionLoader />
        ) : otherTeams.length > 0 ? (
          <>
            <DiscoverGrid teams={otherTeams} />
            {pagination && pagination.totalPages > 1 && (
              <PaginationBar
                pagination={pagination}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => p + 1)}
              />
            )}
          </>
        ) : (
          <div className="bg-muted/30 text-muted-foreground rounded-2xl border border-dashed py-12 text-center text-sm">
            {search
              ? 'Không tìm thấy đội nào khớp với từ khoá.'
              : 'Chưa có đội nào được duyệt.'}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionLoader() {
  return (
    <div className="flex min-h-[20vh] items-center justify-center">
      <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
    </div>
  );
}

function TeamGrid({ teams }: { teams: (Team & { member_count: number })[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {teams.map((team) => {
        const isPending = team.approval_status === 'pending';
        const card = (
          <div className="relative h-full">
            <TeamCard team={team} />
            {isPending && (
              <span className="bg-background/90 text-muted-foreground absolute top-2 right-2 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium shadow-sm sm:text-xs">
                <Clock className="h-3 w-3" />
                Chờ duyệt
              </span>
            )}
          </div>
        );
        return isPending ? (
          <div key={team.id} className="h-full opacity-70">
            {card}
          </div>
        ) : (
          <Link
            key={team.id}
            href={`/teams/${team.slug}/dashboard`}
            className="block h-full transition-transform hover:-translate-y-1"
          >
            {card}
          </Link>
        );
      })}
    </div>
  );
}

function DiscoverGrid({ teams }: { teams: (Team & { member_count: number })[] }) {
  const join = useJoinTeam();

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {teams.map((team) => {
        const status = team.my_membership_status ?? null;
        const isPendingRequest = status === 'pending';
        const isMember = status === 'approved';
        const disabled = isMember || isPendingRequest || join.isPending;

        const label = isMember
          ? 'Đã tham gia'
          : isPendingRequest
            ? 'Chờ duyệt'
            : 'Xin tham gia';

        return (
          <TeamCard
            key={team.id}
            team={team}
            action={
              <Button
                size="sm"
                variant="ghost"
                className={`h-8 gap-1 px-2 text-xs ${
                  disabled
                    ? 'text-muted-foreground'
                    : 'text-primary hover:text-primary'
                }`}
                disabled={disabled}
                onClick={() => !disabled && join.mutate(team.slug)}
              >
                {isPendingRequest ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <UserPlus className="h-3.5 w-3.5" />
                )}
                {label}
              </Button>
            }
          />
        );
      })}
    </div>
  );
}

function PaginationBar({
  pagination,
  onPrev,
  onNext,
}: {
  pagination: TeamsPagination;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      <span className="text-muted-foreground text-sm">
        Trang {pagination.page} / {pagination.totalPages} • {pagination.total}{' '}
        đội
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!pagination.hasPrev}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!pagination.hasNext}
        >
          Sau
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
