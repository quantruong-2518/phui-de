import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const phoneRegex = /^(\+?84|0)\d{9,10}$/;

const onboardingSchema = z
  .object({
    name: z.string().trim().min(2, 'Tên quá ngắn').max(80),
    // phone optional — phone-auth users already have it on auth.users
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, 'Số điện thoại không hợp lệ')
      .optional(),
    status: z.enum(['team_member', 'free_agent']),
    team: z.object({ id: z.string().uuid() }).optional(),
    role: z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      requiresApproval: z.boolean().optional().default(false),
    }),
  })
  .refine(
    (d) => d.status !== 'team_member' || !!d.team?.id,
    { message: 'Thiếu team khi status=team_member', path: ['team'] },
  );

// POST /api/onboarding — finalize the onboarding flow.
// All-or-nothing: only flips users.onboarding_completed=true after onboarding_data
// (and team_members if joining a team) write succeeds.
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = onboardingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { name, phone, status, team, role } = parsed.data;

    // 1. Upsert onboarding_data
    const { error: onboardingError } = await supabase
      .from('onboarding_data')
      .upsert(
        {
          user_id: user.id,
          status,
          team_id: team?.id ?? null,
          role_id: role.id,
          custom_role: role.id === 'custom' ? role.label : null,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

    if (onboardingError) throw onboardingError;

    // 2. If joining a team, attach to team_members for the active season
    if (status === 'team_member' && team) {
      const { data: activeSeason } = await supabase
        .from('seasons')
        .select('id')
        .eq('is_active', true)
        .maybeSingle();

      const seasonId = activeSeason?.id ?? null;

      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          season_id: seasonId,
          role: 'member',
          team_role_id: role.id,
          team_role_label: role.label,
          approval_status: role.requiresApproval ? 'pending' : 'approved',
        });

      if (memberError && memberError.code !== '23505') {
        // Anything other than "already exists" is fatal
        throw memberError;
      }

      if (memberError?.code === '23505') {
        const update = supabase
          .from('team_members')
          .update({
            team_role_id: role.id,
            team_role_label: role.label,
            approval_status: role.requiresApproval ? 'pending' : 'approved',
          })
          .eq('team_id', team.id)
          .eq('user_id', user.id);
        const { error: updateError } = seasonId
          ? await update.eq('season_id', seasonId)
          : await update;
        if (updateError) throw updateError;
      }
    }

    // 3. Flip user profile last — this is the gate the rest of the app reads
    const userPatch: Record<string, unknown> = {
      name,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };
    if (phone) userPatch.phone = phone;

    const { error: userError } = await supabase
      .from('users')
      .update(userPatch)
      .eq('id', user.id);

    if (userError) throw userError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding API Error:', error);
    return NextResponse.json(
      { error: 'Failed to save onboarding' },
      { status: 500 },
    );
  }
}

// PATCH /api/onboarding — partial profile save during multi-step flow.
// Saves name (and optionally phone for users editing it) without flipping
// onboarding_completed, so users can resume.
const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(phoneRegex, 'Số điện thoại không hợp lệ').optional(),
});

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = {
      name: parsed.data.name,
      updated_at: new Date().toISOString(),
    };
    if (parsed.data.phone) updates.phone = parsed.data.phone;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding PATCH Error:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
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
      .maybeSingle();

    if (error) throw error;
    if (!onboardingData) return NextResponse.json({ data: null });

    let approval = null;
    if (onboardingData.status === 'team_member' && onboardingData.team_id) {
      const { data: activeSeason } = await supabase
        .from('seasons')
        .select('id')
        .eq('is_active', true)
        .maybeSingle();

      let query = supabase
        .from('team_members')
        .select('approval_status, requested_at, approved_at, approved_by')
        .eq('team_id', onboardingData.team_id)
        .eq('user_id', user.id);

      if (activeSeason?.id) {
        query = query.eq('season_id', activeSeason.id);
      }

      const { data: memberData } = await query.maybeSingle();

      if (memberData) {
        approval = {
          status: memberData.approval_status,
          requestedAt: memberData.requested_at,
          approvedAt: memberData.approved_at,
          approvedBy: memberData.approved_by,
        };
      }
    }

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
