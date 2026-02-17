import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/teams/[slug]/players
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

    // Get team ID from slug
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Fetch players
    const { data: players, error } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', team.id)
      .order('position', { ascending: true }); // Logical sort order ideally

    if (error) throw error;

    return NextResponse.json({ data: players });
  } catch (error) {
    console.error('Players API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 },
    );
  }
}

// POST /api/teams/[slug]/players
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const slug = (await params).slug;
    const body = await request.json();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get team ID
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check code uniqueness within team
    const { data: existing } = await supabase
      .from('players')
      .select('id')
      .eq('team_id', team.id)
      .eq('code', body.code)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Mã cầu thủ/Số áo đã tồn tại' },
        { status: 409 },
      );
    }

    // Insert Player
    const { data: player, error } = await supabase
      .from('players')
      .insert({
        team_id: team.id,
        name: body.name,
        code: body.code,
        position: body.position,
        // Default stats
        matches_played: 0,
        goals: 0,
        assists: 0,
        clean_sheets: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: player });
  } catch (error) {
    console.error('Create Player Error:', error);
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 },
    );
  }
}
