import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';

type Params = { params: Promise<{ slug: string }> };

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày YYYY-MM-DD');
const isoTime = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Định dạng giờ HH:MM');

const createSchema = z.object({
  opponent: z.string().trim().min(1).max(80),
  match_date: isoDate,
  match_time: isoTime,
  field: z.string().trim().min(1).max(120).nullable().optional(),
  field_id: z.string().uuid().nullable().optional(),
  status: z.enum(['scheduled', 'live', 'finished', 'cancelled']).optional(),
  goals_scored: z.number().int().min(0).optional(),
  goals_conceded: z.number().int().min(0).optional(),
  result: z.enum(['W', 'L', 'D']).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

// GET — list matches. Optional ?status=scheduled|live|finished|cancelled
export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const ctx = await requireTeamAccess(slug, { allowPublic: true });
  if (isTeamAccessError(ctx)) return ctx;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

  let query = ctx.supabase
    .from('matches')
    .select(
      'id, opponent, field, field_id, match_date, match_time, goals_scored, goals_conceded, result, status, season_id, notes, created_at, field_info:fields(id, name)',
    )
    .eq('team_id', ctx.team.id)
    .order('match_date', { ascending: false })
    .limit(limit);

  if (status === 'scheduled' || status === 'live' || status === 'finished' || status === 'cancelled') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
  return NextResponse.json({ data });
}

// POST — schedule a new match. Member or higher.
export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const ctx = await requireTeamAccess(slug);
  if (isTeamAccessError(ctx)) return ctx;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Active season hookup so trigger can aggregate stats when status flips to finished.
  const { data: activeSeason } = await ctx.supabase
    .from('seasons')
    .select('id')
    .eq('is_active', true)
    .maybeSingle();

  const { data: match, error } = await ctx.supabase
    .from('matches')
    .insert({
      team_id: ctx.team.id,
      season_id: activeSeason?.id ?? null,
      opponent: parsed.data.opponent,
      match_date: parsed.data.match_date,
      match_time: parsed.data.match_time,
      field: parsed.data.field ?? null,
      field_id: parsed.data.field_id ?? null,
      status: parsed.data.status ?? 'scheduled',
      goals_scored: parsed.data.goals_scored ?? 0,
      goals_conceded: parsed.data.goals_conceded ?? 0,
      result: parsed.data.result ?? null,
      notes: parsed.data.notes ?? null,
      created_by: ctx.user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
  }
  return NextResponse.json({ data: match }, { status: 201 });
}
