'use client';

import { MOCK_PASSION_FC_PLAYERS } from '@/lib/mock-data';
import { Crown } from 'lucide-react';

export function PlayerLeaderboard() {
  const players = [...MOCK_PASSION_FC_PLAYERS].sort(
    (a, b) => b.points - a.points,
  );

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="text-muted-foreground grid grid-cols-[1.5rem_1.8rem_1fr_2rem_2rem_2rem_2.5rem] items-center gap-1 px-3 pb-1 text-[9px] font-semibold tracking-wider uppercase">
        <span></span>
        <span>Mã</span>
        <span>Cầu thủ</span>
        <span className="text-center">⚽</span>
        <span className="text-center">👟</span>
        <span className="text-center">🏟️</span>
        <span className="text-right">Điểm</span>
      </div>

      {players.map((player, index) => {
        const rank = index + 1;

        // Top 3 highlight with theme-consistent colors
        let rowClass = 'bg-muted/20';
        let rankContent: React.ReactNode = (
          <span className="text-muted-foreground text-xs font-black">
            {rank}
          </span>
        );

        if (rank === 1) {
          rowClass = 'bg-primary/5 border border-primary/10';
          rankContent = <Crown className="text-accent h-4 w-4" />;
        } else if (rank === 2) {
          rowClass = 'bg-secondary';
          rankContent = <Crown className="text-muted-foreground h-3.5 w-3.5" />;
        } else if (rank === 3) {
          rowClass = 'bg-accent/5';
          rankContent = <Crown className="text-accent/60 h-3.5 w-3.5" />;
        }

        return (
          <div
            key={player.id}
            className={`grid grid-cols-[1.5rem_1.8rem_1fr_2rem_2rem_2rem_2.5rem] items-center gap-1 rounded-lg px-3 py-2 ${rowClass}`}
          >
            <div className="flex items-center justify-center">
              {rankContent}
            </div>
            <span className="text-primary text-xs font-bold">
              {player.code}
            </span>
            <span className="truncate text-xs font-semibold">
              {player.name}
            </span>
            <span className="text-center text-xs font-bold">
              {player.goals}
            </span>
            <span className="text-center text-xs font-bold">
              {player.assists}
            </span>
            <span className="text-muted-foreground text-center text-xs">
              {player.matchesPlayed}
            </span>
            <span className="text-primary text-right text-sm font-black">
              {player.points}
            </span>
          </div>
        );
      })}
    </div>
  );
}
