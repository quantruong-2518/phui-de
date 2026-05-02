import { NextResponse } from 'next/server';
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
      `id, user_id, role, team_role_id, team_role_label, approval_status,
       requested_at, approved_at, joined_at,
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
