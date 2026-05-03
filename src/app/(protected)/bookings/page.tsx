'use client';

import { CalendarCheck2, Loader2, MapPinned, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FieldRow } from '@/features/fields/components/FieldRow';
import { useFields } from '@/features/fields/hooks/use-fields';
import { MatchScheduleForm } from '@/features/matches/components/MatchScheduleForm';
import { useTeamRecentField } from '@/features/matches/hooks/use-matches';
import { useTeams } from '@/features/teams/hooks/use-teams';

export default function BookingsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [pickedFieldId, setPickedFieldId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const teamsQ = useTeams({ scope: 'mine' });
  const myTeam = useMemo(() => {
    const list = teamsQ.data?.data ?? [];
    return list.find((t) => t.approval_status === 'approved') ?? list[0];
  }, [teamsQ.data]);

  const recentQ = useTeamRecentField(myTeam?.slug);
  const fieldsQ = useFields(debounced || undefined);

  const recent = recentQ.data;
  const fields = fieldsQ.data ?? [];

  const handlePick = (fieldId: string) => {
    if (!myTeam) return;
    setPickedFieldId(fieldId);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:py-10">
      <header className="card-featured relative overflow-hidden rounded-2xl p-4 sm:p-5">
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-1/3 -translate-y-1/3 rotate-45 transform bg-white/5 blur-3xl" />
        <div className="bg-amber-500/10 absolute bottom-0 left-0 h-32 w-32 -translate-x-1/3 translate-y-1/3 rotate-12 transform blur-3xl" />
        <div className="relative flex items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 shadow-sm sm:h-14 sm:w-14">
            <CalendarCheck2 className="h-5 w-5 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <h1 className="text-lg font-bold tracking-tight sm:text-2xl">
              Đặt sân
            </h1>
            <p className="text-muted-foreground hidden text-sm sm:block">
              Chọn sân, lên lịch trận. Trận sẽ hiện ở Lịch thi đấu của đội.
            </p>
          </div>
        </div>
      </header>

      {!teamsQ.isLoading && !myTeam && (
        <div className="bg-muted/30 text-muted-foreground rounded-xl px-4 py-6 text-center text-sm">
          Bạn chưa thuộc đội nào. Tạo hoặc tham gia một đội để đặt sân.
        </div>
      )}

      {myTeam && recent && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="text-primary h-4 w-4" />
            <h2 className="text-sm font-bold tracking-tight">
              Sân quen — vừa đá ở đây
            </h2>
          </div>
          <FieldRow
            field={recent}
            actions={
              <Button
                size="sm"
                className="ml-1 h-8 gap-1.5 px-3 text-xs font-semibold"
                onClick={() => handlePick(recent.id)}
              >
                Đá ở đây
              </Button>
            }
          />
        </section>
      )}

      <section className="space-y-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Tìm theo tên sân…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <MapPinned className="text-muted-foreground h-4 w-4" />
          <h2 className="text-sm font-bold tracking-tight">
            Tất cả sân
            {!fieldsQ.isLoading && (
              <span className="text-muted-foreground ml-2 font-normal">
                ({fields.length})
              </span>
            )}
          </h2>
        </div>

        {fieldsQ.isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : fields.length === 0 ? (
          <div className="bg-muted/30 text-muted-foreground rounded-xl py-12 text-center text-sm">
            {debounced
              ? 'Không tìm thấy sân nào.'
              : 'Chưa có sân nào trong hệ thống.'}
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((f) => (
              <FieldRow
                key={f.id}
                field={f}
                actions={
                  <Button
                    size="sm"
                    className="ml-1 h-8 gap-1.5 px-3 text-xs font-semibold"
                    onClick={() => handlePick(f.id)}
                    disabled={!myTeam}
                  >
                    Đá ở đây
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={!!pickedFieldId}
        onOpenChange={(o) => !o && setPickedFieldId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lên lịch trận</DialogTitle>
          </DialogHeader>
          {myTeam && pickedFieldId && (
            <MatchScheduleForm
              slug={myTeam.slug}
              defaultFieldId={pickedFieldId}
              onCreated={() => {
                setPickedFieldId(null);
                router.push(`/teams/${myTeam.slug}/dashboard`);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
