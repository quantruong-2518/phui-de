import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';
import { can } from '@/lib/auth/permissions';

type Params = { params: Promise<{ slug: string; memberId: string }> };

const patchSchema = z
  .object({
    approval_status: z.enum(['approved', 'rejected']).optional(),
    role: z.enum(['admin', 'member']).optional(),
    team_role_id: z.string().min(1).optional(),
    team_role_label: z.string().min(1).optional(),
    is_active: z.boolean().optional(),
    jersey_code: z.string().trim().min(1).max(10).nullable().optional(),
    position: z.enum(['GK', 'DF', 'MF', 'FW']).nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });

// PATCH — duyệt request, đổi role, dừng hoạt động, sửa số áo / vị trí.
// Quy tắc xem `docs/permissions.md`.
export async function PATCH(request: Request, { params }: Params) {
  const { slug, memberId } = await params;

  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Role change yêu cầu owner; còn lại cần admin trở lên.
  const minRole = parsed.data.role !== undefined ? 'owner' : 'admin';
  const ctx = await requireTeamAccess(slug, { minRole });
  if (isTeamAccessError(ctx)) return ctx;

  // Lấy target để check permission cụ thể (kick/deactivate admin → chỉ owner).
  const needsTargetCheck =
    parsed.data.role !== undefined ||
    parsed.data.is_active === false ||
    parsed.data.approval_status === 'rejected';

  if (needsTargetCheck) {
    const { data: target } = await ctx.supabase
      .from('team_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('team_id', ctx.team.id)
      .maybeSingle();

    if (!target) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const targetRole = target.role as 'owner' | 'admin' | 'member';

    if (parsed.data.role !== undefined && targetRole === 'owner') {
      return NextResponse.json(
        { error: 'Không thể đổi vai trò của đội trưởng (owner)' },
        { status: 400 },
      );
    }

    // Deactivate-target check: viewer phải có quyền với target.
    if (
      parsed.data.is_active === false &&
      !can('deactivate', { viewer: ctx.member.role, target: targetRole })
    ) {
      return NextResponse.json(
        { error: 'Không có quyền dừng hoạt động thành viên này' },
        { status: 403 },
      );
    }

    // Reject (đẩy approved → rejected): coi như kick. Cùng rule.
    if (
      parsed.data.approval_status === 'rejected' &&
      !can('kick', { viewer: ctx.member.role, target: targetRole })
    ) {
      return NextResponse.json(
        { error: 'Không có quyền từ chối / đẩy thành viên này ra' },
        { status: 403 },
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

// DELETE — kick. Owner luôn bảo vệ; admin chỉ kick được member; user tự rời.
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

  const targetRole = target.role as 'owner' | 'admin' | 'member';
  const isSelf = target.user_id === ctx.user.id;

  if (!can('kick', { viewer: ctx.member.role, target: targetRole, isSelf })) {
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
