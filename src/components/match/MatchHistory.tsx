'use client';

import { MOCK_PASSION_FC_MATCHES } from '@/lib/mock-data';
import { useMatchStore } from '@/stores/use-match-store';
import type { MatchRecord } from '@/types/match-scoring.types';
import { Trophy, BarChart3 } from 'lucide-react';

const resultBadge: Record<string, string> = {
  W: 'badge-win',
  D: 'badge-draw',
  L: 'badge-loss',
};

export function MatchHistory() {
  const { matchHistory } = useMatchStore();

  const allMatches: MatchRecord[] = [
    ...matchHistory,
    ...MOCK_PASSION_FC_MATCHES,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = allMatches.length;
  const wins = allMatches.filter((m) => m.result === 'W').length;
  const draws = allMatches.filter((m) => m.result === 'D').length;
  const losses = allMatches.filter((m) => m.result === 'L').length;
  const totalGoals = allMatches.reduce((s, m) => s + m.goalsScored, 0);
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Summary bar — card-featured */}
      <div className="card-featured flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-primary text-xl font-black">{wins}</div>
            <div className="text-muted-foreground text-[9px]">Thắng</div>
          </div>
          <div className="text-center">
            <div className="text-accent text-xl font-black">{draws}</div>
            <div className="text-muted-foreground text-[9px]">Hòa</div>
          </div>
          <div className="text-center">
            <div className="text-destructive text-xl font-black">{losses}</div>
            <div className="text-muted-foreground text-[9px]">Thua</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-gradient-primary text-2xl font-black">
            {winRate}%
          </div>
          <div className="text-muted-foreground text-[9px]">
            {total} trận • {totalGoals} bàn
          </div>
        </div>
      </div>

      {/* Match list */}
      <div className="space-y-1">
        {allMatches.map((match) => {
          const dateStr = new Date(match.date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
          });

          return (
            <div
              key={match.id}
              className="bg-muted/30 flex items-center gap-2.5 rounded-lg px-3 py-2"
            >
              {/* Result badge */}
              <span
                className={`h-6 w-6 text-[10px] ${resultBadge[match.result]}`}
              >
                {match.result}
              </span>

              {/* Opponent + field */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {match.opponent}
                </div>
                <div className="text-muted-foreground text-[10px]">
                  {match.field} • {dateStr}
                </div>
              </div>

              {/* Score */}
              <div className="text-base font-black tabular-nums">
                {match.goalsScored}
                <span className="text-muted-foreground mx-0.5 font-normal">
                  -
                </span>
                {match.goalsConceded}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
