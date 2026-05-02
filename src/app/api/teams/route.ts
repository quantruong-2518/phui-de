import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// GET /api/teams - List teams the current user is a member of (or all teams if not authenticated)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const scope = searchParams.get('scope') || 'mine'; // 'mine' | 'all'

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('teams')
      .select(`
        id,
        name,
        slug,
        code,
        logo_url,
        primary_color,
        owner_id,
        created_at,
        member_count:team_members(count)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (scope === 'mine' && user) {
      const { data: memberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);
      const teamIds = (memberships || []).map((m) => m.team_id).filter(Boolean);
      if (teamIds.length === 0) {
        return NextResponse.json({ data: [] });
      }
      query = query.in('id', teamIds);
    }

    if (search.length >= 2) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    const { data: teams, error } = await query;

    if (error) throw error;

    const formatted = teams?.map((t: { member_count?: { count: number }[]; [k: string]: unknown }) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      code: t.code,
      logo_url: t.logo_url,
      primary_color: t.primary_color,
      owner_id: t.owner_id,
      member_count: t.member_count?.[0]?.count ?? 0,
    })) || [];

    return NextResponse.json({ data: formatted });
  } catch (error) {
    console.error('List Teams Error:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

function generateTeamCode(name: string) {
  const prefix = name
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase())
    .join('')
    .substring(0, 3) || 'TEAM';

  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${randomChars}`;
}

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
const phoneRegex = /^(\+?84|0)\d{9,10}$/;

const createTeamSchema = z.object({
  name: z.string().trim().min(3, 'Tên đội quá ngắn').max(50),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug quá ngắn')
    .max(40)
    .regex(slugRegex, 'Slug chỉ được dùng chữ thường, số và dấu gạch ngang'),
  primaryColor: z.string().regex(hexColorRegex).optional(),
  secondaryColor: z.string().regex(hexColorRegex).optional(),
  // Optional onboarding completion payload
  profile: z
    .object({
      name: z.string().trim().min(2).max(80),
      phone: z.string().trim().regex(phoneRegex),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = createTeamSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, slug, primaryColor, secondaryColor, profile } = parsed.data;
    const code = generateTeamCode(name);

    // Single atomic RPC: insert team + season + owner member + onboarding +
    // user profile. Postgres rolls back everything on failure.
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('create_team_with_owner', {
        p_name: name,
        p_slug: slug,
        p_primary_color: primaryColor ?? null,
        p_secondary_color: secondaryColor ?? null,
        p_code: code,
        p_profile_name: profile?.name ?? null,
        p_profile_phone: profile?.phone ?? null,
      })
      .single();

    if (rpcError) {
      if (rpcError.code === '23505') {
        return NextResponse.json(
          { error: `Slug "${slug}" đã được sử dụng. Hãy chọn URL khác.` },
          { status: 409 },
        );
      }
      if (rpcError.code === '42501') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      throw rpcError;
    }

    const result = rpcData as { team_id: string; slug: string };
    return NextResponse.json({
      success: true,
      teamId: result.team_id,
      slug: result.slug,
    });
  } catch (error) {
    console.error('Create Team API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create team.' },
      { status: 500 },
    );
  }
}
