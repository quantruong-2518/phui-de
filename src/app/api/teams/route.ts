import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

function emptyPagination(page: number, pageSize: number) {
  return {
    page,
    pageSize,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };
}

// GET /api/teams - List teams. scope=mine returns the user's teams (incl.
// pending). scope=all returns the public discover list (only approved teams).
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const scope = searchParams.get('scope') === 'all' ? 'all' : 'mine';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10),
      ),
    );
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from('teams')
      .select(
        `
        id,
        name,
        slug,
        code,
        logo_url,
        primary_color,
        owner_id,
        approval_status,
        created_at,
        member_count:team_members(count)
      `,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    // Map of team_id -> current user's membership status (for UI gating)
    const membershipMap = new Map<string, 'approved' | 'pending' | 'rejected'>();
    if (user) {
      const { data: memberships } = await supabase
        .from('team_members')
        .select('team_id, approval_status')
        .eq('user_id', user.id);
      (memberships || []).forEach((m) => {
        if (m.team_id && m.approval_status) {
          membershipMap.set(
            m.team_id,
            m.approval_status as 'approved' | 'pending' | 'rejected',
          );
        }
      });
    }

    if (scope === 'mine') {
      if (!user) {
        return NextResponse.json({
          data: [],
          pagination: emptyPagination(page, pageSize),
        });
      }
      // "Mine" = approved memberships only (pending requests are shown elsewhere).
      const teamIds = Array.from(membershipMap.entries())
        .filter(([, status]) => status === 'approved')
        .map(([id]) => id);
      if (teamIds.length === 0) {
        return NextResponse.json({
          data: [],
          pagination: emptyPagination(page, pageSize),
        });
      }
      query = query.in('id', teamIds);
    } else {
      query = query.eq('approval_status', 'approved');
    }

    if (search.length >= 2) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    const { data: teams, error, count } = await query;

    if (error) throw error;

    const formatted =
      teams?.map(
        (t: {
          id: string;
          member_count?: { count: number }[];
          [k: string]: unknown;
        }) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          code: t.code,
          logo_url: t.logo_url,
          primary_color: t.primary_color,
          owner_id: t.owner_id,
          approval_status: t.approval_status,
          member_count: t.member_count?.[0]?.count ?? 0,
          my_membership_status: membershipMap.get(t.id) ?? null,
        }),
      ) || [];

    const total = count || 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return NextResponse.json({
      data: formatted,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('List Teams Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 },
    );
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
      pendingApproval: true,
    });
  } catch (error) {
    console.error('Create Team API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create team.' },
      { status: 500 },
    );
  }
}
