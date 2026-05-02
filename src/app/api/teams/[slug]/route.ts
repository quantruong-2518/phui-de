import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';

type Params = { params: Promise<{ slug: string }> };

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/);
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const patchSchema = z
  .object({
    name: z.string().trim().min(3).max(50).optional(),
    slug: z.string().trim().min(3).max(40).regex(slugRegex).optional(),
    primary_color: hexColor.optional(),
    secondary_color: hexColor.optional(),
    logo_url: z.string().url().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const ctx = await requireTeamAccess(slug, { allowPublic: true });
  if (isTeamAccessError(ctx)) return ctx;

  const { data: team, error } = await ctx.supabase
    .from('teams')
    .select(
      `id, name, slug, code, logo_url, primary_color, secondary_color, owner_id, created_at,
       member_count:team_members(count)`,
    )
    .eq('id', ctx.team.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }

  const { member_count, ...rest } = team as { member_count: { count: number }[]; [k: string]: unknown };
  return NextResponse.json({
    data: { ...rest, member_count: member_count?.[0]?.count ?? 0 },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug } = await params;
  const ctx = await requireTeamAccess(slug, { minRole: 'owner' });
  if (isTeamAccessError(ctx)) return ctx;

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { error } = await ctx.supabase
    .from('teams')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', ctx.team.id);

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug đã được sử dụng' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
