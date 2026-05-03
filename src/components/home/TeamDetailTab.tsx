'use client';

import { useState } from 'react';
import {
  Trophy,
  Target,
  TrendingUp,
  Shield,
  Flame,
  History,
  Crown,
  BarChart3,
  Zap,
} from 'lucide-react';
import {
  MOCK_PASSION_FC,
  MOCK_PASSION_FC_PLAYERS,
  MOCK_PASSION_FC_STATS,
} from '@/lib/mock-data';

import { LiveMatchScoring } from '@/components/match/LiveMatchScoring';
import { MatchHistory } from '@/components/match/MatchHistory';
import { PlayerLeaderboard } from '@/components/match/PlayerLeaderboard';
import { UpcomingMatches } from '@/components/match/UpcomingMatches';
import { useMatchStore } from '@/stores/use-match-store';

interface TeamDetailTabProps {
  role?: { label: string; icon: string };
}

type TabId = 'overview' | 'matches' | 'players';

const resultBadge: Record<string, string> = {
  W: 'badge-win',
  D: 'badge-draw',
  L: 'badge-loss',
};

const badgeIcons: Record<string, React.ElementType> = {
  shield: Shield,
  trend: TrendingUp,
  zap: Zap,
  award: Trophy,
};

export function TeamDetailTab({ role }: TeamDetailTabProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { liveMatch } = useMatchStore();

  const team = MOCK_PASSION_FC;
  const players = MOCK_PASSION_FC_PLAYERS;
  const stats = MOCK_PASSION_FC_STATS;
  const topPlayers = [...players]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* ===== Compact Team Header ("Card lẹm canvas") ===== */}
      <div className="card-featured relative overflow-hidden rounded-[20px] p-5">
        {/* Abstract decorative shape ("lẹm canvas") */}
        <div className="absolute top-0 right-0 h-24 w-24 translate-x-1/3 -translate-y-1/3 rotate-45 transform bg-white/5 blur-2xl" />
        <div className="bg-primary/10 absolute bottom-0 left-0 h-32 w-32 -translate-x-1/3 translate-y-1/3 rotate-12 transform blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo box */}
            <div className="from-primary to-primary/80 shadow-primary/20 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg">
              <Shield className="text-primary-foreground h-7 w-7" />
            </div>

            {/* Title & Badges */}
            <div>
              <h2 className="text-xl font-bold tracking-tight">{team.name}</h2>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {team.badges?.map((badge: any) => {
                  const Icon = badgeIcons[badge.icon] || Shield;
                  return (
                    <span
                      key={badge.id}
                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${badge.color}`}
                    >
                      <Icon className="h-3 w-3" />
                      {badge.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Role badge (optional, simplified) */}
          {role && (
            <div className="bg-background/50 rounded-full px-2 py-1 text-[10px] font-bold backdrop-blur-sm">
              {role.label}
            </div>
          )}
        </div>
      </div>

      {/* ===== Live Match (Only shows if active) ===== */}
      {liveMatch && <LiveMatchScoring />}

      {/* ===== Tab Navigation ===== */}
      <div className="bg-muted flex gap-0.5 rounded-lg p-1">
        {[
          {
            id: 'overview' as TabId,
            label: 'Tổng quan',
            icon: <BarChart3 className="h-3.5 w-3.5" />,
          },
          {
            id: 'matches' as TabId,
            label: 'Lịch sử',
            icon: <History className="h-3.5 w-3.5" />,
          },
          {
            id: 'players' as TabId,
            label: 'BXH',
            icon: <Crown className="h-3.5 w-3.5" />,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== Tab Content ===== */}

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Upcoming Matches (Start Match Flow) */}
          {!liveMatch && <UpcomingMatches />}

          {/* Stats summary */}
          <div className="card-featured grid grid-cols-4 gap-3 p-4">
            <div className="text-center">
              <Trophy className="text-primary mx-auto mb-1 h-4 w-4" />
              <div className="text-primary text-xl font-black">
                {stats.wins}
              </div>
              <div className="text-muted-foreground text-[9px]">Thắng</div>
            </div>
            <div className="text-center">
              <Target className="text-destructive mx-auto mb-1 h-4 w-4" />
              <div className="text-destructive text-xl font-black">
                {stats.losses}
              </div>
              <div className="text-muted-foreground text-[9px]">Thua</div>
            </div>
            <div className="text-center">
              <BarChart3 className="text-muted-foreground mx-auto mb-1 h-4 w-4" />
              <div className="text-xl font-black">{stats.goalsScored}</div>
              <div className="text-muted-foreground text-[9px]">Bàn thắng</div>
            </div>
            <div className="text-center">
              <TrendingUp className="text-accent mx-auto mb-1 h-4 w-4" />
              <div className="text-gradient-primary text-xl font-black">
                {stats.winRate}%
              </div>
              <div className="text-muted-foreground text-[9px]">
                Tỉ lệ thắng
              </div>
            </div>
          </div>

          {/* Recent form */}
          <div className="flex items-center gap-3">
            <Flame className="text-accent h-4 w-4 shrink-0" />
            <span className="text-muted-foreground text-xs font-medium">
              Phong độ
            </span>
            <div className="flex gap-1.5">
              {stats.recentForm.map((r, i) => (
                <div
                  key={i}
                  className={`h-7 w-7 text-[10px] ${resultBadge[r]}`}
                >
                  {r}
                </div>
              ))}
            </div>
            <span className="text-muted-foreground ml-auto text-[10px]">
              {stats.totalMatches} trận
            </span>
          </div>

          {/* Top players */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Top cầu thủ</span>
              <button
                onClick={() => setActiveTab('players')}
                className="text-primary text-xs font-medium"
              >
                Tất cả →
              </button>
            </div>
            <div className="space-y-1">
              {topPlayers.map((p, i) => (
                <div
                  key={p.id}
                  className="bg-muted/30 flex items-center gap-2 rounded-lg px-3 py-2"
                >
                  <span className="text-muted-foreground w-4 text-xs font-black">
                    {i + 1}
                  </span>
                  <span className="text-primary w-6 text-xs font-bold">
                    #{p.code}
                  </span>
                  <span className="flex-1 truncate text-xs font-semibold">
                    {p.name}
                  </span>
                  <span className="text-primary w-7 text-right text-xs font-black">
                    {p.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'matches' && (
        <div className="space-y-4">
          {/* Also show upcoming here so users can start booked matches from Matches tab too */}
          {!liveMatch && <UpcomingMatches />}
          <MatchHistory />
        </div>
      )}

      {activeTab === 'players' && <PlayerLeaderboard />}
    </div>
  );
}
