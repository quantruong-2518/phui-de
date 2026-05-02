import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';

type Params = { params: Promise<{ slug: string }> };

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  code: z.string().trim().min(1).max(10).optional(),
  position: z.enum(['GK', 'DF', 'MF', 'FW']).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
});

// GET /api/teams/[slug]/players — list squad
export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const ctx = await requireTeamAccess(slug, { allowPublic: true });
  if (isTeamAccessError(ctx)) return ctx;

  const { data, error } = await ctx.supabase
    .from('players')
    .select('id, name, code, position, avatar_url, matches_played, goals, assists, clean_sheets, total_points, created_at')
    .eq('team_id', ctx.team.id)
    .order('total_points', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
  return NextResponse.json({ data });
}

// POST /api/teams/[slug]/players — add player. Admin/owner only.
export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const ctx = await requireTeamAccess(slug, { minRole: 'admin' });
  if (isTeamAccessError(ctx)) return ctx;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: player, error } = await ctx.supabase
    .from('players')
    .insert({
      team_id: ctx.team.id,
      name: parsed.data.name,
      code: parsed.data.code ?? null,
      position: parsed.data.position ?? null,
      avatar_url: parsed.data.avatar_url ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Số áo đã tồn tại trong đội' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
  }

  return NextResponse.json({ data: player }, { status: 201 });
}
