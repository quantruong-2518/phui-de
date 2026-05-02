import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';

type Params = { params: Promise<{ slug: string; id: string }> };

const createSchema = z.object({
  player_id: z.string().uuid(),
  event_type: z.enum(['goal', 'assist', 'clean_sheet', 'own_goal']),
  minute: z.number().int().min(0).max(200).nullable().optional(),
});

// POST — record an event. The DB trigger `bump_player_stats` auto-bumps
// player counters (goals/assists/clean_sheets). For goals/own_goals we also
// auto-increment the match scoreline so live scoring stays in sync.
export async function POST(request: Request, { params }: Params) {
  const { slug, id: matchId } = await params;
  const ctx = await requireTeamAccess(slug);
  if (isTeamAccessError(ctx)) return ctx;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Verify match + player belong to this team
  const [matchRes, playerRes] = await Promise.all([
    ctx.supabase
      .from('matches')
      .select('id, goals_scored, goals_conceded')
      .eq('id', matchId)
      .eq('team_id', ctx.team.id)
      .maybeSingle(),
    ctx.supabase
      .from('players')
      .select('id')
      .eq('id', parsed.data.player_id)
      .eq('team_id', ctx.team.id)
      .maybeSingle(),
  ]);

  if (!matchRes.data) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }
  if (!playerRes.data) {
    return NextResponse.json({ error: 'Player does not belong to this team' }, { status: 400 });
  }

  const { data: event, error } = await ctx.supabase
    .from('match_events')
    .insert({
      match_id: matchId,
      player_id: parsed.data.player_id,
      event_type: parsed.data.event_type,
      minute: parsed.data.minute ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }

  // Keep match scoreline in sync with the just-added goal
  if (parsed.data.event_type === 'goal') {
    await ctx.supabase
      .from('matches')
      .update({ goals_scored: (matchRes.data.goals_scored ?? 0) + 1 })
      .eq('id', matchId);
  } else if (parsed.data.event_type === 'own_goal') {
    await ctx.supabase
      .from('matches')
      .update({ goals_conceded: (matchRes.data.goals_conceded ?? 0) + 1 })
      .eq('id', matchId);
  }

  return NextResponse.json({ data: event }, { status: 201 });
}
