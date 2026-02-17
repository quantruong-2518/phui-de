import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/teams/[slug]/dashboard
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const slug = (await params).slug;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get team info
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('slug', slug)
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check membership
    const { data: member, error: memberError } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', team.id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mock stats for now (Real implementation would count tables)
    const stats = {
      team,
      totalPlayers: 0,
      totalMatches: 0,
      winRate: 0,
      goalsScored: 0,
      recentMatches: [],
      topScorers: [],
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 },
    );
  }
}
