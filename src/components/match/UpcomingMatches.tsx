'use client';

import { Calendar, Clock, MapPin, Play, Ticket } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  useDeleteMatch,
  useMatches,
} from '@/features/matches/hooks/use-matches';
import type { Match } from '@/features/matches/types/match.types';
import { useMatchStore } from '@/stores/use-match-store';

/** Ghép `match_date` + `match_time` thành Date local. */
function kickoffOf(m: Match): Date {
  const time = m.match_time.length === 5 ? `${m.match_time}:00` : m.match_time;
  return new Date(`${m.match_date}T${time}`);
}

export function UpcomingMatches() {
  const { id: slug } = useParams<{ id: string }>();
  const { data: matches, isLoading } = useMatches(slug, 'scheduled');
  const remove = useDeleteMatch(slug);
  const { startMatch } = useMatchStore();

  // Tick mỗi 30s để gate "Bắt đầu" tự enable khi qua giờ kick-off,
  // không cần user refresh.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const upcoming = (matches ?? [])
    .slice()
    .sort((a, b) => kickoffOf(a).getTime() - kickoffOf(b).getTime());

  const handleStart = (m: Match) => {
    const fieldName = m.field_info?.name ?? m.field ?? 'Sân chưa chọn';
    startMatch(m.opponent, fieldName);
    toast.success('Bắt đầu trận!', {
      description: `Đang ghi nhận trận với ${m.opponent}`,
    });
  };

  const handleCancel = (m: Match) => {
    if (!confirm(`Huỷ trận với ${m.opponent}?`)) return;
    remove.mutate(m.id);
  };

  if (isLoading) return null;
  if (upcoming.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Ticket className="text-primary h-4 w-4" />
        <h3 className="text-sm font-semibold">Lịch thi đấu</h3>
      </div>

      <div className="grid gap-3">
        {upcoming.map((m) => {
          const kickoff = kickoffOf(m);
          const isToday = kickoff.toDateString() === new Date(now).toDateString();
          const canStart = now >= kickoff.getTime();
          const dateStr = kickoff.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
          });
          const timeStr = kickoff.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
          const fieldName = m.field_info?.name ?? m.field;

          return (
            <div
              key={m.id}
              className="bg-card relative overflow-hidden rounded-xl p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold">{m.opponent}</span>
                    {isToday && (
                      <span className="inline-flex animate-pulse items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                        Hôm nay
                      </span>
                    )}
                  </div>

                  <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono">{timeStr}</span> · {dateStr}
                    </span>
                    {fieldName && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {fieldName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2 pt-3">
                {canStart ? (
                  <Button
                    className="shadow-primary/20 flex-1 gap-1.5 shadow-lg"
                    size="sm"
                    onClick={() => handleStart(m)}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Bắt đầu
                  </Button>
                ) : (
                  <Button
                    className="flex-1 gap-1.5 opacity-50"
                    size="sm"
                    variant="secondary"
                    disabled
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {isToday ? 'Chưa đến giờ' : 'Chưa đến ngày'}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive px-3"
                  onClick={() => handleCancel(m)}
                  disabled={remove.isPending}
                >
                  Hủy
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
