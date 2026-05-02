import { NextResponse } from 'next/server';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';

type Params = {
  params: Promise<{ slug: string; id: string; eventId: string }>;
};

// DELETE — undo an event. Trigger reverses player stats. We also adjust
// match scoreline if the event was a goal/own_goal.
export async function DELETE(_req: Request, { params }: Params) {
  const { slug, id: matchId, eventId } = await params;
  const ctx = await requireTeamAccess(slug);
  if (isTeamAccessError(ctx)) return ctx;

  const { data: event } = await ctx.supabase
    .from('match_events')
    .select('event_type, match:matches!match_events_match_id_fkey(team_id, goals_scored, goals_conceded)')
    .eq('id', eventId)
    .eq('match_id', matchId)
    .maybeSingle();

  type EventRow = {
    event_type: 'goal' | 'assist' | 'clean_sheet' | 'own_goal';
    match: { team_id: string; goals_scored: number; goals_conceded: number };
  };
  const ev = event as EventRow | null;

  if (!ev || ev.match.team_id !== ctx.team.id) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const { error } = await ctx.supabase
    .from('match_events')
    .delete()
    .eq('id', eventId);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }

  if (ev.event_type === 'goal') {
    await ctx.supabase
      .from('matches')
      .update({ goals_scored: Math.max(0, (ev.match.goals_scored ?? 0) - 1) })
      .eq('id', matchId);
  } else if (ev.event_type === 'own_goal') {
    await ctx.supabase
      .from('matches')
      .update({ goals_conceded: Math.max(0, (ev.match.goals_conceded ?? 0) - 1) })
      .eq('id', matchId);
  }

  return NextResponse.json({ success: true });
}
