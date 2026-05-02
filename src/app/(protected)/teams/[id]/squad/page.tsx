'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlayerForm } from '@/features/players/components/PlayerForm';
import {
  POSITION_LABEL,
  type Player,
} from '@/features/players/types/player.types';
import {
  useDeletePlayer,
  usePlayers,
} from '@/features/players/hooks/use-players';
import { Loader2, Trash2, UserPlus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function TeamSquadPage() {
  const { id: slug } = useParams<{ id: string }>();
  const { data: players, isLoading } = usePlayers(slug);
  const { mutate: removePlayer, isPending: isDeleting } = useDeletePlayer(slug);
  const [open, setOpen] = useState(false);

  const handleDelete = (p: Player) => {
    if (confirm(`Xóa cầu thủ "${p.name}"?`)) removePlayer(p.id);
  };

  return (
    <div className="animate-in fade-in-50 space-y-6 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight">Đội hình</h2>
          <p className="text-muted-foreground text-sm">
            Danh sách cầu thủ và thành tích cá nhân.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              Thêm cầu thủ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm cầu thủ</DialogTitle>
            </DialogHeader>
            <PlayerForm slug={slug} onCreated={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      )}

      {!isLoading && (!players || players.length === 0) && (
        <div className="bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <UserPlus className="text-muted-foreground mb-3 h-10 w-10" />
          <p className="text-muted-foreground text-sm">
            Chưa có cầu thủ nào. Bấm <strong>Thêm cầu thủ</strong> để bắt đầu.
          </p>
        </div>
      )}

      {players && players.length > 0 && (
        <div className="space-y-2">
          {players.map((p, idx) => (
            <div
              key={p.id}
              className="bg-card hover:bg-muted/30 flex items-center gap-3 rounded-xl border p-3 transition-colors"
            >
              <span className="text-muted-foreground w-6 text-center text-xs font-bold">
                {idx + 1}
              </span>
              <Avatar className="h-10 w-10">
                <AvatarFallback>{p.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold">{p.name}</p>
                  {p.code && (
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      #{p.code}
                    </Badge>
                  )}
                  {p.position && (
                    <Badge variant="outline" className="text-[10px]">
                      {POSITION_LABEL[p.position]}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  ⚽ {p.goals} · 🅰 {p.assists} · 🧤 {p.clean_sheets} ·{' '}
                  <span className="text-foreground font-bold">
                    {p.total_points} điểm
                  </span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive h-8 w-8"
                disabled={isDeleting}
                onClick={() => handleDelete(p)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
