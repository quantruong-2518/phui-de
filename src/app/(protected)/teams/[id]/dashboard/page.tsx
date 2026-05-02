import {
  Trophy,
  Target,
  TrendingUp,
  Flame,
  BarChart3,
  Calendar,
  Settings,
} from 'lucide-react';
import { UpcomingMatches } from '@/components/match/UpcomingMatches';
import { LiveMatchScoring } from '@/components/match/LiveMatchScoring';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function TeamDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  const supabase = await createClient();

  // 1. Fetch Team info
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('slug', slug)
    .single();

  if (teamError || !team) {
    notFound();
  }

  // 2. Fetch Active Season Stats
  const { data: activeSeason } = await supabase
    .from('seasons')
    .select('id')
    .eq('is_active', true)
    .single();

  let stats = {
    wins: 0,
    losses: 0,
    goalsScored: 0,
    totalMatches: 0,
    winRate: 0,
    recentForm: ['-', '-', '-', '-', '-'],
  };

  if (activeSeason) {
    const { data: teamSeason } = await supabase
      .from('team_seasons')
      .select('*')
      .eq('team_id', team.id)
      .eq('season_id', activeSeason.id)
      .single();

    if (teamSeason) {
      const totalMatches = teamSeason.matches_played || 0;
      const wins = teamSeason.wins || 0;
      stats = {
        wins,
        losses: teamSeason.losses || 0,
        goalsScored: teamSeason.goals_scored || 0,
        totalMatches,
        winRate: totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0,
        recentForm: ['-', '-', '-', '-', '-'], // Placeholder for actual match history
      };
    }
  }

  // 3. Fetch Top Players (Mock for now since we don't have match_events yet)
  const topPlayers: any[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{team.name}</h1>
        <p className="text-muted-foreground text-sm">Mã đội: {team.code}</p>
      </div>

      {/* 1. Live Match (Highest Priority) - Client Component */}
      <div className="animate-in zoom-in-95 duration-500">
        <LiveMatchScoring />
      </div>

      {/* 2. Upcoming / Booking */}
      <UpcomingMatches />

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
          <div className="flex gap-1.5 opacity-50">
            <span className="text-muted-foreground text-xs italic">
              Chưa có dữ liệu thi đấu
            </span>
          </div>
        </div>

        {/* 5. Top Players Preview */}
        <div className="bg-card rounded-xl border p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">Cầu thủ xuất sắc</h3>
            <Link
              href={`/teams/${slug}/squad`}
              className="text-primary hover:text-primary/80 text-xs font-bold transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-2">
            {topPlayers.length === 0 ? (
              <div className="text-muted-foreground text-xs italic opacity-50">
                Chưa có số liệu
              </div>
            ) : (
              topPlayers.slice(0, 3).map((p, i) => (
                <div
                  key={p.id}
                  className="bg-muted/30 hover:bg-muted/50 flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
                >
                  {/* Player row template */}
                </div>
              ))
            )}
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
          href={`/teams/${slug}/settings`}
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
