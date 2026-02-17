import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/teams/[slug]/players/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  try {
    const { slug, id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify team access (optional but good practice)
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Fetch player with logic to ensure they belong to the team
    const { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .eq('team_id', team.id)
      .single();

    if (error || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({ data: player });
  } catch (error) {
    console.error('Player Detail API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player details' },
      { status: 500 },
    );
  }
}
