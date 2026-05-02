import { NextResponse } from 'next/server';
import { isTeamAccessError, requireTeamAccess } from '@/lib/auth/team-access';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const ctx = await requireTeamAccess(slug);
  if (isTeamAccessError(ctx)) return ctx;

  const { supabase, team } = ctx;

  // Active season
  const { data: activeSeason } = await supabase
    .from('seasons')
    .select('id, year, name')
    .eq('is_active', true)
    .maybeSingle();

  // Run independent reads in parallel
  const seasonId = activeSeason?.id ?? null;
  const [
    { count: totalPlayers },
    teamSeasonRes,
    recentMatchesRes,
    topScorersRes,
  ] = await Promise.all([
    supabase
      .from('team_members')
      .select('id', { count: 'exact', head: true })
      .eq('team_id', team.id)
      .eq('approval_status', 'approved')
      .eq('is_active', true),
    seasonId
      ? supabase
          .from('team_seasons')
          .select('matches_played, wins, draws, losses, goals_scored, goals_conceded, total_points')
          .eq('team_id', team.id)
          .eq('season_id', seasonId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from('matches')
      .select('id, opponent, match_date, result, goals_scored, goals_conceded, status')
      .eq('team_id', team.id)
      .order('match_date', { ascending: false })
      .limit(5),
    supabase
      .from('team_members')
      .select(
        `id, jersey_code, position, goals, assists, total_points,
         user:users!team_members_user_id_fkey(name)`,
      )
      .eq('team_id', team.id)
      .eq('approval_status', 'approved')
      .eq('is_active', true)
      .order('total_points', { ascending: false })
      .limit(5),
  ]);

  const seasonStats = teamSeasonRes?.data ?? null;
  const recentMatches = recentMatchesRes.data ?? [];
  type RawTopScorer = {
    id: string;
    jersey_code: string | null;
    position: string | null;
    goals: number;
    assists: number;
    total_points: number;
    user: { name: string | null } | null;
  };
  const topScorers = ((topScorersRes.data ?? []) as unknown as RawTopScorer[]).map((s) => ({
    id: s.id,
    name: s.user?.name || 'Ẩn danh',
    code: s.jersey_code,
    position: s.position,
    goals: s.goals,
    assists: s.assists,
    total_points: s.total_points,
  }));

  const matchesPlayed = seasonStats?.matches_played ?? 0;
  const wins = seasonStats?.wins ?? 0;
  const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;

  return NextResponse.json({
    data: {
      team,
      season: activeSeason,
      stats: {
        totalPlayers: totalPlayers ?? 0,
        totalMatches: matchesPlayed,
        wins,
        draws: seasonStats?.draws ?? 0,
        losses: seasonStats?.losses ?? 0,
        goalsScored: seasonStats?.goals_scored ?? 0,
        goalsConceded: seasonStats?.goals_conceded ?? 0,
        winRate,
        totalPoints: seasonStats?.total_points ?? 0,
      },
      recentMatches,
      topScorers,
    },
  });
}
