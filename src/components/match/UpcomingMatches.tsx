'use client';

import { useMatchStore } from '@/stores/use-match-store';
import { MOCK_UPCOMING_MATCHES } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Ticket, Play, X } from 'lucide-react';
import { toast } from 'sonner';

export function UpcomingMatches() {
  const { startMatch } = useMatchStore();
  const matches = MOCK_UPCOMING_MATCHES;

  const handleStart = (match: (typeof matches)[0]) => {
    startMatch(match.opponent, match.field);
    toast.success('Trận đấu đã bắt đầu!', {
      description: `Đang ghi nhận trận đấu với ${match.opponent}`,
    });
  };

  const handleCancel = (id: string) => {
    toast.info('Tính năng hủy chưa được implement');
  };

  if (matches.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Ticket className="text-primary h-4 w-4" />
        <h3 className="text-sm font-semibold">Lịch thi đấu</h3>
      </div>

      <div className="grid gap-3">
        {matches.map((match) => {
          const isToday =
            new Date(match.date).toDateString() === new Date().toDateString();
          const dateStr = new Date(match.date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
          });

          return (
            <div
              key={match.id}
              className="group border-border bg-card hover:border-primary/50 relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold">
                      {match.opponent}
                    </span>
                    {isToday && (
                      <span className="inline-flex animate-pulse items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                        Hôm nay
                      </span>
                    )}
                  </div>

                  <div className="text-muted-foreground flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {match.time} • {dateStr}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {match.field}
                    </span>
                  </div>

                  <div className="bg-secondary text-secondary-foreground mt-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium">
                    <Ticket className="h-3 w-3" />
                    {match.odds}
                  </div>
                </div>
              </div>

              {/* Actions - visible if today or just always visible for booked matches? 
                  User said "vào ngày đó có thể bấm start". Let's show if isToday for stricter UX, 
                  or just enabled if today. Let's make it always visible but highlighted if today. */}

              <div className="border-border mt-4 flex gap-2 border-t pt-3">
                {isToday ? (
                  <Button
                    className="shadow-primary/20 flex-1 gap-1.5 shadow-lg"
                    size="sm"
                    onClick={() => handleStart(match)}
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
                    Chưa đến ngày
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive px-3"
                  onClick={() => handleCancel(match.id)}
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
