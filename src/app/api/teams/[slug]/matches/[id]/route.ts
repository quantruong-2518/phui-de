import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';

type Params = { params: Promise<{ slug: string; id: string }> };

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const patchSchema = z
  .object({
    opponent: z.string().trim().min(1).max(80).optional(),
    match_date: isoDate.optional(),
    field: z.string().trim().max(120).nullable().optional(),
    status: z.enum(['scheduled', 'live', 'finished', 'cancelled']).optional(),
    goals_scored: z.number().int().min(0).optional(),
    goals_conceded: z.number().int().min(0).optional(),
    result: z.enum(['W', 'L', 'D']).nullable().optional(),
    notes: z.string().max(500).nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });

// GET — match detail with events. Server reshapes team_member join into the
// same `player_id` / `player.{name,code,position}` shape the UI expects.
export async function GET(_req: Request, { params }: Params) {
  const { slug, id } = await params;
  const ctx = await requireTeamAccess(slug, { allowPublic: true });
  if (isTeamAccessError(ctx)) return ctx;

  const { data: match, error } = await ctx.supabase
    .from('matches')
    .select(
      `id, opponent, field, match_date, goals_scored, goals_conceded, result, status, season_id, notes, created_at,
       events:match_events(id, team_member_id, event_type, minute, created_at,
         member:team_members!match_events_team_member_id_fkey(
           id, jersey_code, position,
           user:users!team_members_user_id_fkey(id, name)
         ))`,
    )
    .eq('id', id)
    .eq('team_id', ctx.team.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch match' }, { status: 500 });
  }
  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  }

  type RawEvent = {
    id: string;
    team_member_id: string;
    event_type: string;
    minute: number | null;
    created_at: string;
    member: {
      id: string;
      jersey_code: string | null;
      position: string | null;
      user: { id: string; name: string | null } | null;
    } | null;
  };
  const events = ((match as unknown as { events?: RawEvent[] }).events ?? []).map(
    (ev) => ({
      id: ev.id,
      player_id: ev.team_member_id,
      event_type: ev.event_type,
      minute: ev.minute,
      created_at: ev.created_at,
      player: ev.member
        ? {
            id: ev.member.id,
            name: ev.member.user?.name || 'Ẩn danh',
            code: ev.member.jersey_code,
            position: ev.member.position,
          }
        : null,
    }),
  );

  const reshaped = { ...(match as Record<string, unknown>), events };
  return NextResponse.json({ data: reshaped });
}

// PATCH — update score / status / etc. Auto-derive `result` from goals if not given
// and status is being set to 'finished'.
export async function PATCH(request: Request, { params }: Params) {
  const { slug, id } = await params;
  const ctx = await requireTeamAccess(slug);
  if (isTeamAccessError(ctx)) return ctx;

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.status === 'finished' && parsed.data.result === undefined) {
    // Need current scores to derive result
    const { data: cur } = await ctx.supabase
      .from('matches')
      .select('goals_scored, goals_conceded')
      .eq('id', id)
      .eq('team_id', ctx.team.id)
      .maybeSingle();

    const scored = parsed.data.goals_scored ?? cur?.goals_scored ?? 0;
    const conceded = parsed.data.goals_conceded ?? cur?.goals_conceded ?? 0;
    updates.result = scored > conceded ? 'W' : scored < conceded ? 'L' : 'D';
  }

  const { error } = await ctx.supabase
    .from('matches')
    .update(updates)
    .eq('id', id)
    .eq('team_id', ctx.team.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// DELETE — admin/owner only
export async function DELETE(_req: Request, { params }: Params) {
  const { slug, id } = await params;
  const ctx = await requireTeamAccess(slug, { minRole: 'admin' });
  if (isTeamAccessError(ctx)) return ctx;

  const { error } = await ctx.supabase
    .from('matches')
    .delete()
    .eq('id', id)
    .eq('team_id', ctx.team.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
