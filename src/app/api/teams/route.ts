import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/teams - List teams with optional search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('teams')
      .select('id, name, slug, code, logo_url, primary_color, secondary_color, owner_id, created_at, updated_at');

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    const { data: teams, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;

    // Add member count to each team
    const teamsWithCount = await Promise.all(
      (teams || []).map(async (team) => {
        const { count } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', team.id);

        return { ...team, member_count: count || 0 };
      }),
    );

    return NextResponse.json({ data: teamsWithCount });
  } catch (error) {
    console.error('Teams API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 },
    );
  }
}

// POST /api/teams - Create a new team
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Simple validation (can assume frontend did heavy lifting, but good to be safe)
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const slug =
      body.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + `-${Math.floor(Math.random() * 1000)}`;

    // Transaction-like: Create Team -> Add Member
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: body.name,
        slug: slug,
        primary_color: body.primary_color,
        secondary_color: body.secondary_color,
        owner_id: user.id,
      })
      .select()
      .single();

    if (teamError) throw teamError;

    const { error: memberError } = await supabase.from('team_members').insert({
      team_id: team.id,
      user_id: user.id,
      role: 'owner',
    });

    if (memberError) {
      // Rollback (delete team) if member creation fails
      await supabase.from('teams').delete().eq('id', team.id);
      throw memberError;
    }

    return NextResponse.json({ data: team });
  } catch (error) {
    console.error('Create Team Error:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 },
    );
  }
}
