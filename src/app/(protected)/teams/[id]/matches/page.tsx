'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MatchScheduleForm } from '@/features/matches/components/MatchScheduleForm';
import {
  MATCH_STATUS_LABEL,
  type Match,
} from '@/features/matches/types/match.types';
import { useMatches } from '@/features/matches/hooks/use-matches';
import { CalendarPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

function MatchRow({ slug, match }: { slug: string; match: Match }) {
  const result = match.result;
  const resultClass =
    result === 'W'
      ? 'bg-primary/15 text-primary'
      : result === 'L'
        ? 'bg-destructive/15 text-destructive'
        : result === 'D'
          ? 'bg-muted text-foreground'
          : 'bg-muted/50 text-muted-foreground';

  return (
    <Link
      href={`/teams/${slug}/matches/${match.id}`}
      className="bg-muted/40 hover:bg-muted/60 flex items-center gap-3 rounded-xl p-3 shadow-sm transition-colors"
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-black uppercase ${resultClass}`}
      >
        {result ?? '–'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">vs {match.opponent}</p>
          <Badge
            variant={match.status === 'live' ? 'default' : 'outline'}
            className="text-[10px]"
          >
            {MATCH_STATUS_LABEL[match.status]}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs">
          {match.match_date}
          {match.field ? ` · ${match.field}` : ''}
          {match.status !== 'scheduled' && match.status !== 'cancelled' && (
            <>
              {' · '}
              <span className="text-foreground font-bold">
                {match.goals_scored} – {match.goals_conceded}
              </span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}

export default function TeamMatchesPage() {
  const { id: slug } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: matches, isLoading } = useMatches(slug);
  const [open, setOpen] = useState(false);

  const grouped = (matches ?? []).reduce(
    (acc, m) => {
      if (m.status === 'live') acc.live.push(m);
      else if (m.status === 'scheduled') acc.scheduled.push(m);
      else acc.history.push(m);
      return acc;
    },
    { live: [] as Match[], scheduled: [] as Match[], history: [] as Match[] },
  );

  return (
    <div className="animate-in fade-in-50 space-y-6 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight">Trận đấu</h2>
          <p className="text-muted-foreground text-sm">
            Lịch sắp tới và lịch sử thi đấu.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <CalendarPlus className="h-4 w-4" />
              Tạo lịch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lên lịch trận mới</DialogTitle>
            </DialogHeader>
            <MatchScheduleForm
              slug={slug}
              onCreated={(id) => {
                setOpen(false);
                router.push(`/teams/${slug}/matches/${id}`);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      )}

      {!isLoading && matches?.length === 0 && (
        <div className="bg-muted/30 flex flex-col items-center justify-center rounded-xl py-16 text-center">
          <CalendarPlus className="text-muted-foreground mb-3 h-10 w-10" />
          <p className="text-muted-foreground text-sm">
            Chưa có trận nào. Tạo lịch đầu tiên.
          </p>
        </div>
      )}

      {grouped.live.length > 0 && (
        <Section title="🔴 Đang diễn ra" matches={grouped.live} slug={slug} />
      )}
      {grouped.scheduled.length > 0 && (
        <Section title="Sắp tới" matches={grouped.scheduled} slug={slug} />
      )}
      {grouped.history.length > 0 && (
        <Section title="Lịch sử" matches={grouped.history} slug={slug} />
      )}
    </div>
  );
}

function Section({
  title,
  matches,
  slug,
}: {
  title: string;
  matches: Match[];
  slug: string;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-2">
        {matches.map((m) => (
          <MatchRow key={m.id} slug={slug} match={m} />
        ))}
      </div>
    </section>
  );
}
