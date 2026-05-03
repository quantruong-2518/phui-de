'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  POSITION_LABEL,
  type Player,
  type PlayerPosition,
} from '@/features/players/types/player.types';
import {
  useDeletePlayer,
  usePlayers,
  useUpdatePlayer,
} from '@/features/players/hooks/use-players';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

const POSITION_NONE = '__none';

export default function TeamSquadPage() {
  const { id: slug } = useParams<{ id: string }>();
  const { data: players, isLoading } = usePlayers(slug);
  const { mutate: removePlayer, isPending: isDeleting } = useDeletePlayer(slug);
  const [editing, setEditing] = useState<Player | null>(null);

  const handleDelete = (p: Player) => {
    if (confirm(`Xoá ${p.name} khỏi đội? (sẽ mất stats trong các trận đã đấu)`)) {
      removePlayer(p.id);
    }
  };

  return (
    <div className="animate-in fade-in-50 space-y-6 duration-500">
      <div className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight">Đội hình</h2>
        <p className="text-muted-foreground text-sm">
          Số áo, vị trí, thống kê thi đấu của các thành viên đang hoạt động.
          Cầu thủ mới đến từ yêu cầu tham gia (tab Thành viên).
        </p>
      </div>

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      )}

      {!isLoading && (!players || players.length === 0) && (
        <div className="bg-muted/30 text-muted-foreground rounded-xl py-16 text-center text-sm">
          Chưa có thành viên hoạt động. Khi thành viên xin tham gia và được duyệt,
          họ sẽ xuất hiện ở đây.
        </div>
      )}

      {players && players.length > 0 && (
        <div className="space-y-2">
          {players.map((p, idx) => (
            <div
              key={p.id}
              className="bg-muted/40 hover:bg-muted/60 flex items-center gap-3 rounded-xl p-3 shadow-sm transition-colors"
            >
              <span className="text-muted-foreground w-6 text-center text-xs font-bold">
                {idx + 1}
              </span>
              <Avatar className="h-10 w-10">
                <AvatarFallback>{p.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
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
                className="text-muted-foreground hover:text-foreground h-8 w-8"
                onClick={() => setEditing(p)}
                aria-label="Sửa số áo / vị trí"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive h-8 w-8"
                disabled={isDeleting}
                onClick={() => handleDelete(p)}
                aria-label="Xoá khỏi đội"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <EditPlayerDialog
        slug={slug}
        player={editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

function EditPlayerDialog({
  slug,
  player,
  onClose,
}: {
  slug: string;
  player: Player | null;
  onClose: () => void;
}) {
  const update = useUpdatePlayer(slug);
  const [code, setCode] = useState('');
  const [position, setPosition] = useState<string>(POSITION_NONE);

  // Re-sync state whenever the dialog opens with a different player
  if (player && code === '' && position === POSITION_NONE) {
    setCode(player.code ?? '');
    setPosition(player.position ?? POSITION_NONE);
  }

  const handleClose = () => {
    setCode('');
    setPosition(POSITION_NONE);
    onClose();
  };

  const handleSave = () => {
    if (!player) return;
    update.mutate(
      {
        id: player.id,
        patch: {
          code: code.trim() === '' ? null : code.trim(),
          position:
            position === POSITION_NONE ? null : (position as PlayerPosition),
        },
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Dialog
      open={!!player}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{player?.name ?? ''}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="jersey">Số áo</Label>
            <Input
              id="jersey"
              placeholder="10"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Vị trí</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn vị trí" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={POSITION_NONE}>Không chọn</SelectItem>
                <SelectItem value="GK">Thủ môn</SelectItem>
                <SelectItem value="DF">Hậu vệ</SelectItem>
                <SelectItem value="MF">Tiền vệ</SelectItem>
                <SelectItem value="FW">Tiền đạo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={update.isPending}>
            Huỷ
          </Button>
          <Button onClick={handleSave} disabled={update.isPending}>
            {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
