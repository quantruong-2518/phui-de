'use client';

import { PlayerLeaderboard } from '@/components/match/PlayerLeaderboard';
import { Button } from '@/components/ui/button';
import { UserPlus, Share2 } from 'lucide-react';

export default function TeamSquadPage() {
  return (
    <div className="animate-in fade-in-50 space-y-6 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight">
            Thành viên đội bóng
          </h2>
          <p className="text-muted-foreground text-sm">
            Danh sách cầu thủ và bảng xếp hạng thành tích.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Mời</span>
          </Button>
          <Button size="sm" className="h-9 gap-1.5">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Thêm</span>
          </Button>
        </div>
      </div>

      <PlayerLeaderboard />
    </div>
  );
}
