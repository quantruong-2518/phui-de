'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeamDashboard } from '@/features/teams/hooks/use-team-dashboard';
import { Activity, Users, Trophy, Goal } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function TeamDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: dashboard, isLoading, error } = useTeamDashboard(slug);

  if (isLoading) return <div>Loading...</div>;

  if (error || !dashboard) return <div>Error loading dashboard</div>;

  const { team } = dashboard;

  return (
    <div className="container mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold">
            {team.logo_url ? (
              <img
                src={team.logo_url}
                alt={team.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              team.name.substring(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <p className="text-muted-foreground">Dashboard</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Settings</Button>
          <Button>Invite Player</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalPlayers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Matches Played
            </CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalMatches}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Trophy className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.winRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Scored</CardTitle>
            <Goal className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.goalsScored}</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No matches played yet.</p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Scorers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No stats available.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
