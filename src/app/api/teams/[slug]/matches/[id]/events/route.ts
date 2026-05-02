import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';

type Params = { params: Promise<{ slug: string; id: string }> };

// `player_id` ở API surface giờ là team_members.id (squad row id).
const createSchema = z.object({
  player_id: z.string().uuid(),
  event_type: z.enum(['goal', 'assist', 'clean_sheet', 'own_goal']),
  minute: z.number().int().min(0).max(200).nullable().optional(),
});

// POST — record an event. Trigger `bump_team_member_stats` tự cộng dồn stats
// cho team_member tương ứng. Goals/own-goals đồng thời tăng tỷ số trận.
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

  // Verify match + member belong to this team
  const [matchRes, memberRes] = await Promise.all([
    ctx.supabase
      .from('matches')
      .select('id, goals_scored, goals_conceded')
      .eq('id', matchId)
      .eq('team_id', ctx.team.id)
      .maybeSingle(),
    ctx.supabase
      .from('team_members')
      .select('id')
      .eq('id', parsed.data.player_id)
      .eq('team_id', ctx.team.id)
      .maybeSingle(),
  ]);

  if (!matchRes.data) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }
  if (!memberRes.data) {
    return NextResponse.json(
      { error: 'Player does not belong to this team' },
      { status: 400 },
    );
  }

  const { data: event, error } = await ctx.supabase
    .from('match_events')
    .insert({
      match_id: matchId,
      team_member_id: parsed.data.player_id,
      event_type: parsed.data.event_type,
      minute: parsed.data.minute ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }

  // Sync match scoreline with the just-added goal
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
