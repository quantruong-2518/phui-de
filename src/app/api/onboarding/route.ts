import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/onboarding - Save user onboarding data
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
    const { status, team, role, phone, name } = body;

    // Validate required fields
    if (!status || !role || !phone || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // 1. Update/create user profile
    const { error: userError } = await supabase.from('users').upsert({
      id: user.id,
      name,
      phone,
      updated_at: new Date().toISOString(),
    });

    if (userError) throw userError;

    // 2. Save onboarding data
    const { error: onboardingError } = await supabase
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        status,
        team_id: team?.id || null,
        role_id: role.id,
        custom_role: role.id === 'custom' ? role.label : null,
        completed_at: new Date().toISOString(),
      });

    if (onboardingError) throw onboardingError;

    // 3. If team member, create team_members record
    if (status === 'team_member' && team) {
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'member',
          team_role_id: role.id,
          team_role_label: role.label,
          approval_status: role.requiresApproval ? 'pending' : 'approved',
        });

      if (memberError) {
        // If member already exists, update instead
        if (memberError.code === '23505') {
          // Unique constraint violation
          const { error: updateError } = await supabase
            .from('team_members')
            .update({
              team_role_id: role.id,
              team_role_label: role.label,
              approval_status: role.requiresApproval ? 'pending' : 'approved',
            })
            .eq('team_id', team.id)
            .eq('user_id', user.id);

          if (updateError) throw updateError;
        } else {
          throw memberError;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding API Error:', error);
    return NextResponse.json(
      { error: 'Failed to save onboarding' },
      { status: 500 },
    );
  }
}

// GET /api/onboarding - Get user onboarding status
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get onboarding data with related team and user info
    const { data: onboardingData, error } = await supabase
      .from('onboarding_data')
      .select(
        `
        *,
        teams:team_id (
          id,
          name,
          code,
          logo_url
        ),
        users:user_id (
          name,
          phone
        )
      `,
      )
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

    // If no onboarding data found, return null
    if (!onboardingData) {
      return NextResponse.json({ data: null });
    }

    // Get approval status if team member
    let approval = null;
    if (onboardingData.status === 'team_member' && onboardingData.team_id) {
      const { data: memberData } = await supabase
        .from('team_members')
        .select('approval_status, requested_at, approved_at, approved_by')
        .eq('team_id', onboardingData.team_id)
        .eq('user_id', user.id)
        .single();

      if (memberData) {
        approval = {
          status: memberData.approval_status,
          requestedAt: memberData.requested_at,
          approvedAt: memberData.approved_at,
          approvedBy: memberData.approved_by,
        };
      }
    }

    // Format response to match UserOnboardingData interface
    const response = {
      status: onboardingData.status,
      team: onboardingData.teams
        ? {
          id: onboardingData.teams.id,
          name: onboardingData.teams.name,
          code: onboardingData.teams.code,
        }
        : null,
      role: {
        id: onboardingData.role_id,
        label:
          onboardingData.custom_role ||
          getRoleLabel(onboardingData.role_id),
        icon: getRoleIcon(onboardingData.role_id),
        requiresApproval: approval?.status === 'pending',
      },
      name: onboardingData.users?.name || '',
      phone: onboardingData.users?.phone || '',
      approval: approval || {
        status: 'approved',
        requestedAt: onboardingData.completed_at,
      },
      createdAt: onboardingData.completed_at,
    };

    return NextResponse.json({ data: response });
  } catch (error) {
    console.error('Get Onboarding Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding' },
      { status: 500 },
    );
  }
}

// Helper functions to get role label and icon
function getRoleLabel(roleId: string): string {
  const roleMap: Record<string, string> = {
    coach: 'HLV',
    captain: 'Đội trưởng',
    vice_captain: 'Đội phó',
    member: 'Đội viên',
    soul: 'Linh hồn của đội',
    striker: 'Tiền đạo',
    midfielder: 'Tiền vệ',
    defender: 'Hậu vệ',
    goalkeeper: 'Thủ môn',
  };
  return roleMap[roleId] || 'Vai trò khác';
}

function getRoleIcon(roleId: string): string {
  const iconMap: Record<string, string> = {
    coach: '🎯',
    captain: '👑',
    vice_captain: '⭐',
    member: '⚽',
    soul: '💚',
    striker: '⚡',
    midfielder: '🎯',
    defender: '🛡️',
    goalkeeper: '🧤',
  };
  return iconMap[roleId] || '⭐';
}
