import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';

type Params = { params: Promise<{ slug: string; id: string }> };

const patchSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    code: z.string().trim().min(1).max(10).nullable().optional(),
    position: z.enum(['GK', 'DF', 'MF', 'FW']).nullable().optional(),
    avatar_url: z.string().url().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });

// GET — player detail
export async function GET(_req: Request, { params }: Params) {
  const { slug, id } = await params;
  const ctx = await requireTeamAccess(slug, { allowPublic: true });
  if (isTeamAccessError(ctx)) return ctx;

  const { data: player, error } = await ctx.supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .eq('team_id', ctx.team.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 });
  }
  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }
  return NextResponse.json({ data: player });
}

// PATCH — update player profile. Admin/owner only.
export async function PATCH(request: Request, { params }: Params) {
  const { slug, id } = await params;
  const ctx = await requireTeamAccess(slug, { minRole: 'admin' });
  if (isTeamAccessError(ctx)) return ctx;

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { error } = await ctx.supabase
    .from('players')
    .update(parsed.data)
    .eq('id', id)
    .eq('team_id', ctx.team.id);

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Số áo đã tồn tại' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// DELETE — remove player. Admin/owner only.
export async function DELETE(_req: Request, { params }: Params) {
  const { slug, id } = await params;
  const ctx = await requireTeamAccess(slug, { minRole: 'admin' });
  if (isTeamAccessError(ctx)) return ctx;

  const { error } = await ctx.supabase
    .from('players')
    .delete()
    .eq('id', id)
    .eq('team_id', ctx.team.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
