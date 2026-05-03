import { NextResponse } from 'next/server';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';

type Params = { params: Promise<{ slug: string }> };

interface RawTeamMemberRow {
  id: string;
  jersey_code: string | null;
  position: 'GK' | 'DF' | 'MF' | 'FW' | null;
  matches_played: number;
  goals: number;
  assists: number;
  clean_sheets: number;
  total_points: number;
  is_active: boolean;
  display_name: string | null;
  created_at: string;
  user: { id: string; name: string | null; avatar_url: string | null } | null;
}

// GET /api/teams/[slug]/players — squad. Đọc từ team_members (chỉ approved &
// active). Stats giờ thuộc về cặp user×team.
export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const ctx = await requireTeamAccess(slug, { allowPublic: true });
  if (isTeamAccessError(ctx)) return ctx;

  const { data, error } = await ctx.supabase
    .from('team_members')
    .select(
      `id, jersey_code, position, matches_played, goals, assists, clean_sheets,
       total_points, is_active, joined_at, display_name,
       user:users!team_members_user_id_fkey (id, name, avatar_url)`,
    )
    .eq('team_id', ctx.team.id)
    .eq('approval_status', 'approved')
    .eq('is_active', true)
    .order('total_points', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch squad' }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as (Omit<RawTeamMemberRow, 'created_at'> & {
    joined_at: string;
  })[];
  const formatted = rows.map((m) => ({
    id: m.id,
    name: m.user?.name || m.display_name || 'Ẩn danh',
    code: m.jersey_code,
    position: m.position,
    avatar_url: m.user?.avatar_url ?? null,
    matches_played: m.matches_played,
    goals: m.goals,
    assists: m.assists,
    clean_sheets: m.clean_sheets,
    total_points: m.total_points,
    created_at: m.joined_at,
    updated_at: m.joined_at,
  }));

  return NextResponse.json({ data: formatted });
}
