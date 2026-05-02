import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';

type Params = { params: Promise<{ slug: string; memberId: string }> };

const patchSchema = z
  .object({
    approval_status: z.enum(['approved', 'rejected']).optional(),
    role: z.enum(['admin', 'member']).optional(),
    team_role_id: z.string().min(1).optional(),
    team_role_label: z.string().min(1).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });

// PATCH — approve/reject pending member, change admin role, or change team_role.
export async function PATCH(request: Request, { params }: Params) {
  const { slug, memberId } = await params;
  const ctx = await requireTeamAccess(slug, { minRole: 'admin' });
  if (isTeamAccessError(ctx)) return ctx;

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Owner cannot demote themselves via this route — guard:
  if (parsed.data.role) {
    const { data: target } = await ctx.supabase
      .from('team_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('team_id', ctx.team.id)
      .maybeSingle();
    if (target?.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot change role of the team owner' },
        { status: 400 },
      );
    }
  }

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.approval_status === 'approved') {
    updates.approved_at = new Date().toISOString();
    updates.approved_by = ctx.user.id;
  }

  const { error } = await ctx.supabase
    .from('team_members')
    .update(updates)
    .eq('id', memberId)
    .eq('team_id', ctx.team.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE — remove member from team. Owner cannot be removed; user can also
// self-remove (kick themselves).
export async function DELETE(_req: Request, { params }: Params) {
  const { slug, memberId } = await params;
  const ctx = await requireTeamAccess(slug);
  if (isTeamAccessError(ctx)) return ctx;

  const { data: target } = await ctx.supabase
    .from('team_members')
    .select('user_id, role')
    .eq('id', memberId)
    .eq('team_id', ctx.team.id)
    .maybeSingle();

  if (!target) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }
  if (target.role === 'owner') {
    return NextResponse.json({ error: 'Cannot remove the team owner' }, { status: 400 });
  }

  const isSelf = target.user_id === ctx.user.id;
  const isAdminOrOwner = ctx.member.role === 'owner' || ctx.member.role === 'admin';
  if (!isSelf && !isAdminOrOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await ctx.supabase
    .from('team_members')
    .delete()
    .eq('id', memberId)
    .eq('team_id', ctx.team.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
