'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayerStatsCards } from '@/features/players/components/PlayerStatsCards';
import { usePlayer } from '@/features/players/hooks/use-player';
import { ArrowLeft, Loader2, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PlayerDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const id = params.id as string;
  const { data: player, isLoading } = usePlayer(slug, id);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!player) {
    return <div>Player not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/teams/${slug}/players`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm font-medium"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Dánh sách cầu thủ
        </Link>
        <Button variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </Button>
      </div>

      {/* Profile */}
      <div className="flex items-start gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={player.avatar_url || ''} />
          <AvatarFallback className="text-2xl">
            {player.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{player.name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-base">
              #{player.code}
            </Badge>
            <Badge>{player.position}</Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      <PlayerStatsCards player={player} />
    </div>
  );
}
