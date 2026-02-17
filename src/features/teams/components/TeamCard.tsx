import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import type { Team } from '../types/team.types';

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/teams/${team.slug}/dashboard`}>
      <Card className="group h-full overflow-hidden border-0 shadow-sm transition-shadow duration-300 hover:shadow-lg">
        <div
          className="h-2 w-full"
          style={{ backgroundColor: team.primary_color || '#22c55e' }}
        />
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold transition duration-300 group-hover:scale-110">
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
              <h3 className="group-hover:text-primary text-lg font-bold transition">
                {team.name}
              </h3>
              <p className="text-muted-foreground text-sm">Admin</p>
            </div>
          </div>

          <div className="text-muted-foreground mt-4 flex gap-4 text-sm">
            <div>
              <span className="text-foreground font-semibold">0</span> Players
            </div>
            <div>
              <span className="text-foreground font-semibold">0</span> Matches
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
