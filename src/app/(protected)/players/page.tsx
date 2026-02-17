'use client';

import { ShieldHalf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOCK_PLAYERS } from '@/lib/mock-data';
import { PlayerCard } from '@/features/players/components/PlayerCard';

export default function PlayersPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">CẦU THỦ</h1>
          <p className="text-muted-foreground text-sm">
            Top cầu thủ nổi bật tuần này.
          </p>
        </div>
        <Button className="h-10 rounded-md px-4 text-sm font-medium">
          <ShieldHalf className="mr-2 h-4 w-4" />
          Hồ sơ của tôi
        </Button>
      </div>

      {/* Players List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_PLAYERS.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}
