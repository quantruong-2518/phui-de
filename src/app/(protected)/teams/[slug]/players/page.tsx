'use client';

import { Button } from '@/components/ui/button';
import { PlayerListTable } from '@/features/players/components/PlayerListTable';
import { usePlayers } from '@/features/players/hooks/use-players';
import { Loader2, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PlayersPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: players, isLoading } = usePlayers(slug);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Danh sách cầu thủ
          </h2>
          <p className="text-muted-foreground">
            Quản lý thành viên và chỉ số của đội.
          </p>
        </div>
        <Link href={`/teams/${slug}/players/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm cầu thủ
          </Button>
        </Link>
      </div>

      {players && players.length > 0 ? (
        <PlayerListTable players={players} />
      ) : (
        <div className="animate-in fade-in-50 flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="bg-muted mx-auto flex h-20 w-20 items-center justify-center rounded-full">
            <Users className="text-muted-foreground h-10 w-10" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Chưa có cầu thủ nào</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Đội bóng này chưa có thành viên. Hãy thêm cầu thủ để bắt đầu trận
            đấu.
          </p>
          <Link href={`/teams/${slug}/players/new`}>
            <Button>Thêm cầu thủ ngay</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
