import { NextResponse } from 'next/server';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';

type Params = { params: Promise<{ slug: string }> };

// GET /api/teams/[slug]/recent-field — sân của trận mới nhất có field_id.
// Dùng cho quick-book ở /bookings.
export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const ctx = await requireTeamAccess(slug, { allowPublic: true });
  if (isTeamAccessError(ctx)) return ctx;

  const { data, error } = await ctx.supabase
    .from('matches')
    .select('field:fields(*)')
    .eq('team_id', ctx.team.id)
    .not('field_id', 'is', null)
    .order('match_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: 'Không tải được sân gần nhất' },
      { status: 500 },
    );
  }

  // PostgREST trả về field là object hoặc null khi join.
  return NextResponse.json({ data: data?.field ?? null });
}
