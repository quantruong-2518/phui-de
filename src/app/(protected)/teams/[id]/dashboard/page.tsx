'use client';

import {
  Trophy,
  Target,
  TrendingUp,
  Flame,
  BarChart3,
  Calendar,
  Settings,
} from 'lucide-react';
import {
  MOCK_PASSION_FC_STATS,
  MOCK_PASSION_FC_PLAYERS,
  MOCK_PASSION_FC,
} from '@/lib/mock-data';
import { useMatchStore } from '@/stores/use-match-store';
import { UpcomingMatches } from '@/components/match/UpcomingMatches';
import { LiveMatchScoring } from '@/components/match/LiveMatchScoring';
import Link from 'next/link';

const resultBadge: Record<string, string> = {
  W: 'badge-win',
  D: 'badge-draw',
  L: 'badge-loss',
};

export default function TeamDashboardPage({
  params,
}: {
  params: { id: string };
}) {
  const { liveMatch } = useMatchStore();
  const stats = MOCK_PASSION_FC_STATS;
  const topPlayers = [...MOCK_PASSION_FC_PLAYERS]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 1. Live Match (Highest Priority) */}
      {liveMatch && (
        <div className="animate-in zoom-in-95 duration-500">
          <LiveMatchScoring />
        </div>
      )}

      {/* 2. Upcoming / Booking (If no live match) */}
      {!liveMatch && <UpcomingMatches />}

      {/* 3. Stats Summary */}
      <div className="card-featured grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        <div className="text-center">
          <Trophy className="text-primary mx-auto mb-1 h-5 w-5" />
          <div className="text-primary text-2xl font-black">{stats.wins}</div>
          <div className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
            Thắng
          </div>
        </div>
        <div className="text-center">
          <Target className="text-destructive mx-auto mb-1 h-5 w-5" />
          <div className="text-destructive text-2xl font-black">
            {stats.losses}
          </div>
          <div className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
            Thua
          </div>
        </div>
        <div className="text-center">
          <BarChart3 className="text-muted-foreground mx-auto mb-1 h-5 w-5" />
          <div className="text-2xl font-black">{stats.goalsScored}</div>
          <div className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
            Bàn thắng
          </div>
        </div>
        <div className="text-center">
          <TrendingUp className="text-accent mx-auto mb-1 h-5 w-5" />
          <div className="text-gradient-primary text-2xl font-black">
            {stats.winRate}%
          </div>
          <div className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
            Tỉ lệ thắng
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 4. Recent Form */}
        <div className="bg-card rounded-xl border p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Flame className="text-accent h-5 w-5" />
            <h3 className="font-bold">Phong độ gần đây</h3>
            <span className="text-muted-foreground ml-auto text-xs font-medium">
              {stats.totalMatches} trận
            </span>
          </div>
          <div className="flex gap-1.5">
            {stats.recentForm.map((r, i) => (
              <div
                key={i}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-black ${resultBadge[r]}`}
              >
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* 5. Top Players Preview */}
        <div className="bg-card rounded-xl border p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">Cầu thủ xuất sắc</h3>
            <Link
              href={`/teams/${params.id}/squad`}
              className="text-primary hover:text-primary/80 text-xs font-bold transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-2">
            {topPlayers.slice(0, 3).map((p, i) => (
              <div
                key={p.id}
                className="bg-muted/30 hover:bg-muted/50 flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                    i === 0
                      ? 'bg-primary/20 text-primary'
                      : i === 1
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <span className="text-primary font-bold">#{p.code}</span>
                  <span className="truncate text-sm font-semibold">
                    {p.name}
                  </span>
                </div>
                <div className="text-primary text-sm font-black">
                  {p.points}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions (Admin only - simplification) */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-muted/30 hover:bg-muted/50 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-6 transition-colors">
          <Calendar className="text-muted-foreground h-6 w-6" />
          <span className="text-muted-foreground text-xs font-medium">
            Đặt sân mới
          </span>
        </button>
        <Link
          href={`/teams/${params.id}/settings`}
          className="bg-muted/30 hover:bg-muted/50 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-6 transition-colors"
        >
          <Settings className="text-muted-foreground h-6 w-6" />
          <span className="text-muted-foreground text-xs font-medium">
            Quản lý đội
          </span>
        </Link>
      </div>
    </div>
  );
}
