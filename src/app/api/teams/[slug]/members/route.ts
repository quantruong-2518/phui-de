import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';

type Params = { params: Promise<{ slug: string }> };

// GET /api/teams/[slug]/members
// Returns all members for the active season. Members can see each other.
export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const ctx = await requireTeamAccess(slug);
  if (isTeamAccessError(ctx)) return ctx;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // 'pending' | 'approved' | 'rejected' | null

  const { data: activeSeason } = await ctx.supabase
    .from('seasons')
    .select('id')
    .eq('is_active', true)
    .maybeSingle();

  let query = ctx.supabase
    .from('team_members')
    .select(
      `id, user_id, display_name, role, team_role_id, team_role_label, approval_status,
       requested_at, approved_at, joined_at,
       jersey_code, position, is_active,
       matches_played, goals, assists, clean_sheets, total_points,
       user:users!team_members_user_id_fkey (id, name, avatar_url)`,
    )
    .eq('team_id', ctx.team.id)
    .order('joined_at', { ascending: true });

  if (activeSeason?.id) {
    query = query.eq('season_id', activeSeason.id);
  }
  if (status === 'pending' || status === 'approved' || status === 'rejected') {
    query = query.eq('approval_status', status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/teams/[slug]/members — owner/admin thêm member trực tiếp.
// Hỗ trợ guest (chỉ display_name) hoặc link sẵn user_id.
const createSchema = z
  .object({
    display_name: z.string().trim().min(1, 'Tên tối thiểu 1 ký tự').max(80).optional(),
    user_id: z.string().uuid().optional(),
    jersey_code: z.string().trim().min(1).max(10).nullable().optional(),
    position: z.enum(['GK', 'DF', 'MF', 'FW']).nullable().optional(),
    team_role_label: z.string().trim().max(40).optional(),
  })
  .refine((d) => !!d.display_name || !!d.user_id, {
    message: 'Cần ít nhất display_name hoặc user_id',
  });

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const ctx = await requireTeamAccess(slug, { minRole: 'admin' });
  if (isTeamAccessError(ctx)) return ctx;

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dữ liệu không hợp lệ', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: activeSeason } = await ctx.supabase
    .from('seasons')
    .select('id')
    .eq('is_active', true)
    .maybeSingle();

  const { data, error } = await ctx.supabase
    .from('team_members')
    .insert({
      team_id: ctx.team.id,
      season_id: activeSeason?.id ?? null,
      user_id: parsed.data.user_id ?? null,
      display_name: parsed.data.display_name ?? null,
      jersey_code: parsed.data.jersey_code ?? null,
      position: parsed.data.position ?? null,
      role: 'member',
      team_role_id: 'member',
      team_role_label: parsed.data.team_role_label ?? 'Thành viên',
      approval_status: 'approved',
      approved_by: ctx.user.id,
      approved_at: new Date().toISOString(),
      is_active: true,
    })
    .select(
      `id, user_id, display_name, role, team_role_id, team_role_label, approval_status,
       requested_at, approved_at, joined_at,
       jersey_code, position, is_active,
       matches_played, goals, assists, clean_sheets, total_points,
       user:users!team_members_user_id_fkey (id, name, avatar_url)`,
    )
    .single();

  if (error) {
    // 23505 = unique violation (vd. trùng số áo trong cùng season).
    const status = error.code === '23505' ? 409 : 500;
    return NextResponse.json(
      { error: error.message || 'Thêm thành viên thất bại' },
      { status },
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
