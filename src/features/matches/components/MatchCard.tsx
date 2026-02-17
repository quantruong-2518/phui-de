import { Calendar, Clock, MapPin, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Match {
  id: string;
  team_name: string;
  opponent_name: string | null;
  time: string;
  date: string;
  location: string;
  status: string;
  type: string;
  format: string;
}

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="space-y-4 p-6">
        {/* Header: Type & Status */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="font-mono text-xs tracking-widest uppercase"
          >
            {match.type}
          </Badge>
          <span className="text-muted-foreground text-xs font-medium">
            {match.format}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
              <Trophy className="text-primary h-6 w-6" />
            </div>
            <span className="text-center text-sm font-bold">
              {match.team_name}
            </span>
          </div>

          <div className="text-muted-foreground/50 text-xl font-black">VS</div>

          <div className="flex flex-col items-center gap-2">
            <div className="bg-secondary/30 flex h-12 w-12 items-center justify-center rounded-full">
              <span className="text-secondary-foreground text-lg font-bold">
                ?
              </span>
            </div>
            <span className="text-muted-foreground line-clamp-1 text-center text-sm font-medium">
              {match.opponent_name || 'Đang tìm...'}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="border-border space-y-2 border-t pt-2">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{match.date}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>{match.time}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{match.location}</span>
          </div>
        </div>

        {/* Action */}
        <Button
          className="mt-4 w-full"
          variant={match.status === 'finding' ? 'default' : 'secondary'}
        >
          {match.status === 'finding' ? 'Nhận Kèo' : 'Xem Chi Tiết'}
        </Button>
      </CardContent>
    </Card>
  );
}
