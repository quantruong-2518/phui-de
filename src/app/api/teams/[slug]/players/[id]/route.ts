import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';
import { can } from '@/lib/auth/permissions';

type Params = { params: Promise<{ slug: string; id: string }> };

const patchSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1)
      .max(10)
      .nullable()
      .optional(),
    position: z.enum(['GK', 'DF', 'MF', 'FW']).nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });

// PATCH — cập nhật số áo / vị trí của member. Owner/admin only.
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

  const updates: Record<string, unknown> = {};
  if (parsed.data.code !== undefined) updates.jersey_code = parsed.data.code;
  if (parsed.data.position !== undefined) updates.position = parsed.data.position;

  const { error } = await ctx.supabase
    .from('team_members')
    .update(updates)
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

// DELETE — kick player khỏi đội. Quy tắc theo `docs/permissions.md`.
export async function DELETE(_req: Request, { params }: Params) {
  const { slug, id } = await params;
  const ctx = await requireTeamAccess(slug, { minRole: 'admin' });
  if (isTeamAccessError(ctx)) return ctx;

  const { data: target } = await ctx.supabase
    .from('team_members')
    .select('user_id, role')
    .eq('id', id)
    .eq('team_id', ctx.team.id)
    .maybeSingle();
  if (!target) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  const targetRole = target.role as 'owner' | 'admin' | 'member';
  const isSelf = target.user_id === ctx.user.id;

  if (!can('kick', { viewer: ctx.member.role, target: targetRole, isSelf })) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await ctx.supabase
    .from('team_members')
    .delete()
    .eq('id', id)
    .eq('team_id', ctx.team.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
