'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  EVENT_LABEL,
  MATCH_STATUS_LABEL,
  type MatchEventType,
  type MatchStatus,
} from '@/features/matches/types/match.types';
import {
  useAddMatchEvent,
  useDeleteMatch,
  useDeleteMatchEvent,
  useMatch,
  useUpdateMatch,
} from '@/features/matches/hooks/use-matches';
import { usePlayers } from '@/features/players/hooks/use-players';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const STATUS_OPTIONS: MatchStatus[] = ['scheduled', 'live', 'finished', 'cancelled'];
const EVENT_OPTIONS: MatchEventType[] = ['goal', 'assist', 'clean_sheet', 'own_goal'];

export default function MatchDetailPage() {
  const router = useRouter();
  const { id: slug, matchId } = useParams<{ id: string; matchId: string }>();
  const { data: match, isLoading } = useMatch(slug, matchId);
  const { data: players } = usePlayers(slug);
  const updateMatch = useUpdateMatch(slug);
  const deleteMatch = useDeleteMatch(slug);
  const addEvent = useAddMatchEvent(slug, matchId);
  const removeEvent = useDeleteMatchEvent(slug, matchId);

  const [pickedPlayer, setPickedPlayer] = useState<string>('');
  const [pickedType, setPickedType] = useState<MatchEventType>('goal');
  const [minute, setMinute] = useState('');

  if (isLoading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-muted-foreground py-20 text-center text-sm">
        Không tìm thấy trận.
      </div>
    );
  }

  const handleAddEvent = () => {
    if (!pickedPlayer) return;
    addEvent.mutate(
      {
        player_id: pickedPlayer,
        event_type: pickedType,
        minute: minute ? parseInt(minute, 10) : null,
      },
      { onSuccess: () => setMinute('') },
    );
  };

  const handleStatus = (status: MatchStatus) => {
    updateMatch.mutate({ id: matchId, patch: { status } });
  };

  const adjustScore = (which: 'goals_scored' | 'goals_conceded', delta: number) => {
    const next = Math.max(0, (match[which] ?? 0) + delta);
    updateMatch.mutate({ id: matchId, patch: { [which]: next } });
  };

  const handleDelete = () => {
    if (confirm('Xóa trận này?')) {
      deleteMatch.mutate(matchId, {
        onSuccess: () => router.push(`/teams/${slug}/matches`),
      });
    }
  };

  return (
    <div className="animate-in fade-in-50 space-y-6 duration-500">
      <Link
        href={`/teams/${slug}/matches`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Trận đấu
      </Link>

      <div className="bg-card space-y-4 rounded-xl border p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">vs {match.opponent}</h2>
            <p className="text-muted-foreground text-sm">
              {match.match_date}
              {match.field ? ` · ${match.field}` : ''}
            </p>
          </div>
          <Badge variant={match.status === 'live' ? 'default' : 'outline'}>
            {MATCH_STATUS_LABEL[match.status]}
          </Badge>
        </div>

        <div className="bg-muted/30 flex items-center justify-center gap-6 rounded-xl p-6 text-center">
          <ScoreCol
            label="Đội mình"
            value={match.goals_scored}
            onInc={() => adjustScore('goals_scored', 1)}
            onDec={() => adjustScore('goals_scored', -1)}
          />
          <span className="text-2xl font-black opacity-30">–</span>
          <ScoreCol
            label={match.opponent}
            value={match.goals_conceded}
            onInc={() => adjustScore('goals_conceded', 1)}
            onDec={() => adjustScore('goals_conceded', -1)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={match.status === s ? 'default' : 'outline'}
              onClick={() => handleStatus(s)}
              disabled={updateMatch.isPending}
            >
              {MATCH_STATUS_LABEL[s]}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive ml-auto"
            onClick={handleDelete}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Xóa
          </Button>
        </div>
      </div>

      {/* Event recorder */}
      <div className="bg-card space-y-3 rounded-xl border p-5 shadow-sm">
        <h3 className="font-bold">Ghi sự kiện</h3>
        <div className="grid gap-2 sm:grid-cols-[1fr_120px_80px_auto]">
          <Select value={pickedPlayer} onValueChange={setPickedPlayer}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn cầu thủ" />
            </SelectTrigger>
            <SelectContent>
              {players?.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.code ? `#${p.code} ` : ''}
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={pickedType}
            onValueChange={(v) => setPickedType(v as MatchEventType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>
                  {EVENT_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="number"
            placeholder="Phút"
            min={0}
            max={200}
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
          />
          <Button
            onClick={handleAddEvent}
            disabled={!pickedPlayer || addEvent.isPending}
          >
            <Plus className="mr-1 h-4 w-4" />
            Ghi
          </Button>
        </div>

        <div className="space-y-1.5 pt-2">
          {match.events?.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-xs">
              Chưa có sự kiện nào.
            </p>
          )}
          {match.events?.map((ev) => (
            <div
              key={ev.id}
              className="hover:bg-muted/50 flex items-center justify-between rounded-md py-2 px-3 text-sm transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-10 font-mono text-xs">
                  {ev.minute != null ? `${ev.minute}'` : '—'}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {EVENT_LABEL[ev.event_type]}
                </Badge>
                <span>{ev.player?.name ?? 'Cầu thủ'}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive h-7 w-7"
                onClick={() => removeEvent.mutate(ev.id)}
                disabled={removeEvent.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreCol({
  label,
  value,
  onInc,
  onDec,
}: {
  label: string;
  value: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-muted-foreground truncate text-xs font-bold uppercase tracking-wider">
        {label}
      </div>
      <div className="text-5xl font-black">{value}</div>
      <div className="flex gap-1">
        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={onDec}>
          –
        </Button>
        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={onInc}>
          +
        </Button>
      </div>
    </div>
  );
}
