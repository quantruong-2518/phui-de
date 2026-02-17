import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/teams - List user's teams
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get teams where user is a member
    const { data: teams, error } = await supabase
      .from('teams')
      .select('*, team_members!inner(user_id)')
      .eq('team_members.user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: teams });
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
