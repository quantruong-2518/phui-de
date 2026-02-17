import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Player {
  id: string;
  name: string;
  position: string;
  rating: number;
  matches_played: number;
  goals?: number;
  assists?: number;
  clean_sheets?: number;
  avatar_url: string | null;
}

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header / Background Pattern */}
      <div className="from-primary/10 to-secondary/10 relative flex h-24 justify-end bg-gradient-to-br p-2">
        <div className="text-foreground/5 absolute top-4 left-4 text-4xl font-black opacity-50 select-none">
          {player.position}
        </div>
        <Badge
          variant="secondary"
          className="bg-background/50 h-6 self-start backdrop-blur-sm"
        >
          RATING {player.rating}
        </Badge>
      </div>

      {/* Avatar & Info */}
      <div className="relative z-10 -mt-10 space-y-4 px-6 pb-6">
        <div className="border-card bg-muted text-muted-foreground flex h-20 w-20 items-center justify-center rounded-full border-4 text-2xl font-bold shadow-sm">
          {player.name.charAt(0)}
        </div>

        <div className="space-y-1 text-center">
          <h3 className="text-lg font-bold">{player.name}</h3>
          <p className="text-primary text-xs font-bold tracking-widest uppercase">
            {player.position}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="border-border grid grid-cols-3 gap-2 border-t py-4">
          <div className="text-center">
            <div className="text-muted-foreground mb-1 text-xs tracking-wider uppercase">
              Trận
            </div>
            <div className="text-lg leading-none font-bold">
              {player.matches_played}
            </div>
          </div>
          <div className="border-border border-l text-center">
            <div className="text-muted-foreground mb-1 text-xs tracking-wider uppercase">
              Bàn
            </div>
            <div className="text-primary text-lg leading-none font-bold">
              {player.goals || '-'}
            </div>
          </div>
          <div className="border-border border-l text-center">
            <div className="text-muted-foreground mb-1 text-xs tracking-wider uppercase">
              Kiến Tạo
            </div>
            <div className="text-lg leading-none font-bold">
              {player.assists || '-'}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-primary w-full text-xs tracking-widest uppercase"
        >
          Xem Hồ Sơ
        </Button>
      </div>
    </Card>
  );
}
