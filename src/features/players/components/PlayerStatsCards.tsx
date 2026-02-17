import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Player } from '@/features/players/types/player.types';
import { Activity, Footprints, Goal, Trophy } from 'lucide-react';

interface PlayerStatsCardsProps {
  player: Player;
}

export function PlayerStatsCards({ player }: PlayerStatsCardsProps) {
  const contribution =
    player.matches_played > 0
      ? ((player.goals + player.assists) / player.matches_played).toFixed(2)
      : '0';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Số trận</CardTitle>
          <Activity className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{player.matches_played}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bàn thắng</CardTitle>
          <Goal className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{player.goals}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kiến tạo</CardTitle>
          <Footprints className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{player.assists}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Hiệu suất (G+A/Trận)
          </CardTitle>
          <Trophy className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{contribution}</div>
        </CardContent>
      </Card>
    </div>
  );
}
