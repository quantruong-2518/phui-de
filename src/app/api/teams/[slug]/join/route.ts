import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ slug: string }> };

// POST /api/teams/[slug]/join
// Submit a join request for the current authenticated user.
export async function POST(_request: Request, { params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .select('id, approval_status')
    .eq('slug', slug)
    .maybeSingle();
  if (teamErr || !team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }
  if (team.approval_status !== 'approved') {
    return NextResponse.json(
      { error: 'Đội này chưa được duyệt.' },
      { status: 400 },
    );
  }

  const { data: activeSeason } = await supabase
    .from('seasons')
    .select('id')
    .eq('is_active', true)
    .maybeSingle();

  const { data: existing } = await supabase
    .from('team_members')
    .select('id, approval_status')
    .eq('team_id', team.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    if (existing.approval_status === 'approved') {
      return NextResponse.json(
        { error: 'Bạn đã là thành viên của đội này.' },
        { status: 409 },
      );
    }
    if (existing.approval_status === 'pending') {
      return NextResponse.json(
        { error: 'Yêu cầu đã được gửi, đang chờ duyệt.' },
        { status: 409 },
      );
    }
    // Previously rejected — re-open the request.
    const { error: updErr } = await supabase
      .from('team_members')
      .update({
        approval_status: 'pending',
        requested_at: new Date().toISOString(),
        approved_at: null,
        approved_by: null,
      })
      .eq('id', existing.id);
    if (updErr) {
      return NextResponse.json(
        { error: 'Không gửi được yêu cầu.' },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true, status: 'pending' });
  }

  const { error: insErr } = await supabase.from('team_members').insert({
    team_id: team.id,
    user_id: user.id,
    season_id: activeSeason?.id ?? null,
    role: 'member',
    team_role_id: 'member',
    team_role_label: 'Thành viên',
    approval_status: 'pending',
    requested_at: new Date().toISOString(),
  });

  if (insErr) {
    return NextResponse.json(
      { error: insErr.message || 'Không gửi được yêu cầu.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, status: 'pending' });
}
