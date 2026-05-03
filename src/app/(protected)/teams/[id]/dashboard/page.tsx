import { Trophy, Target, TrendingUp, BarChart3, Crown } from 'lucide-react';
import { UpcomingMatches } from '@/components/match/UpcomingMatches';
import { LiveMatchScoring } from '@/components/match/LiveMatchScoring';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

type TopPlayer = {
  id: string;
  name: string;
  goals: number;
  assists: number;
  total_points: number;
};

export default async function TeamDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  const supabase = await createClient();

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('slug', slug)
    .single();

  if (teamError || !team) {
    notFound();
  }

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
      };
    }
  }

  // TODO: replace mock with real top scorers when match_events ready.
  const topPlayers: TopPlayer[] = [];

  return (
    <div className="space-y-6">
      {/* 1. Stats — gọn, đẹp, đặt đầu */}
      <section className="card-featured grid grid-cols-4 gap-2 p-3 sm:gap-3 sm:p-4">
        <StatCell
          icon={<Trophy className="h-4 w-4" />}
          value={stats.wins}
          label="Thắng"
          tone="primary"
        />
        <StatCell
          icon={<Target className="h-4 w-4" />}
          value={stats.losses}
          label="Thua"
          tone="destructive"
        />
        <StatCell
          icon={<BarChart3 className="h-4 w-4" />}
          value={stats.goalsScored}
          label="Bàn"
          tone="muted"
        />
        <StatCell
          icon={<TrendingUp className="h-4 w-4" />}
          value={`${stats.winRate}%`}
          label="Tỉ lệ"
          tone="gradient"
        />
      </section>

      {/* 2. Live Match (chỉ hiện khi có) */}
      <div className="animate-in zoom-in-95 duration-500">
        <LiveMatchScoring />
      </div>

      {/* 3. Lịch thi đấu */}
      <UpcomingMatches />

      {/* 4. Top 5 cầu thủ xuất sắc */}
      <section className="bg-card rounded-xl p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <h3 className="font-bold">Cầu thủ xuất sắc</h3>
          </div>
          <Link
            href={`/teams/${slug}/members`}
            className="text-primary hover:text-primary/80 text-xs font-bold transition-colors"
          >
            Xem tất cả
          </Link>
        </div>
        {topPlayers.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-xs italic opacity-70">
            Chưa có số liệu
          </p>
        ) : (
          <ol className="space-y-1.5">
            {topPlayers.slice(0, 5).map((p, i) => (
              <TopPlayerRow key={p.id} rank={i + 1} player={p} />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function StatCell({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  tone: 'primary' | 'destructive' | 'muted' | 'gradient';
}) {
  const valueClass = {
    primary: 'text-primary',
    destructive: 'text-destructive',
    muted: 'text-foreground',
    gradient: 'text-gradient-primary',
  }[tone];

  const iconClass = {
    primary: 'text-primary',
    destructive: 'text-destructive',
    muted: 'text-muted-foreground',
    gradient: 'text-accent',
  }[tone];

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <span className={`mb-0.5 ${iconClass}`}>{icon}</span>
      <span className={`text-xl font-black sm:text-2xl ${valueClass}`}>
        {value}
      </span>
      <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
        {label}
      </span>
    </div>
  );
}

function TopPlayerRow({ rank, player }: { rank: number; player: TopPlayer }) {
  // 1 = vàng to nhất, 2 = xanh nhỏ hơn, 3-5 = xám
  const styles =
    rank === 1
      ? {
          row: 'bg-amber-500/10',
          rank: 'bg-amber-500 text-white text-2xl h-11 w-11',
          name: 'text-base font-black',
        }
      : rank === 2
        ? {
            row: 'bg-sky-500/10',
            rank: 'bg-sky-500 text-white text-lg h-9 w-9',
            name: 'text-sm font-bold',
          }
        : {
            row: 'bg-muted/40',
            rank: 'bg-muted text-muted-foreground text-sm h-7 w-7',
            name: 'text-sm font-semibold',
          };

  return (
    <li
      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${styles.row}`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-full font-black ${styles.rank}`}
      >
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`truncate ${styles.name}`}>{player.name}</p>
        <p className="text-muted-foreground text-[11px]">
          ⚽ {player.goals} · 🅰 {player.assists} ·{' '}
          <span className="text-foreground font-bold">
            {player.total_points} điểm
          </span>
        </p>
      </div>
    </li>
  );
}
