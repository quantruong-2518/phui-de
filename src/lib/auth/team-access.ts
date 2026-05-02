import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export type TeamMemberRole = 'owner' | 'admin' | 'member';

export interface TeamAccessContext {
  user: { id: string; email?: string };
  team: { id: string; slug: string; name: string; owner_id: string };
  member: { role: TeamMemberRole; approval_status: 'pending' | 'approved' | 'rejected' };
  supabase: Awaited<ReturnType<typeof createClient>>;
}

interface RequireTeamOptions {
  /** Require minimum role. Default: any approved member. */
  minRole?: TeamMemberRole;
  /** If true, allow non-members to read (e.g. public team detail). */
  allowPublic?: boolean;
}

const ROLE_RANK: Record<TeamMemberRole, number> = {
  member: 1,
  admin: 2,
  owner: 3,
};

/**
 * Resolve auth + team membership in one shot. Use at the top of every
 * /api/teams/[slug]/* route to avoid re-implementing auth checks.
 *
 * Returns either a context object or a NextResponse error to short-circuit.
 */
export async function requireTeamAccess(
  slug: string,
  opts: RequireTeamOptions = {},
): Promise<TeamAccessContext | NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !opts.allowPublic) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id, slug, name, owner_id')
    .eq('slug', slug)
    .maybeSingle();

  if (teamError || !team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }

  if (!user) {
    // Public read path
    return {
      user: { id: '' },
      team,
      member: { role: 'member', approval_status: 'approved' },
      supabase,
    };
  }

  const { data: member } = await supabase
    .from('team_members')
    .select('role, approval_status')
    .eq('team_id', team.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!member || member.approval_status !== 'approved') {
    if (opts.allowPublic) {
      return {
        user: { id: user.id, email: user.email },
        team,
        member: { role: 'member', approval_status: 'approved' },
        supabase,
      };
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const required = opts.minRole ?? 'member';
  if (ROLE_RANK[member.role as TeamMemberRole] < ROLE_RANK[required]) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return {
    user: { id: user.id, email: user.email },
    team,
    member: member as TeamAccessContext['member'],
    supabase,
  };
}

export function isTeamAccessError(
  result: TeamAccessContext | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
