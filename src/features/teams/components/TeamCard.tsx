import { Card } from '@/components/ui/card';
import type { ReactNode } from 'react';
import type { Team } from '../types/team.types';

interface TeamCardProps {
  team: Team;
  /** Optional action rendered inside the card on the right (e.g. join button). */
  action?: ReactNode;
}

export function TeamCard({ team, action }: TeamCardProps) {
  const accent = team.primary_color || '#22c55e';
  return (
    <Card className="group relative h-full overflow-hidden border-0 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <span
        aria-hidden
        className="absolute top-0 left-0 h-full w-1"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-center gap-3 p-3 pl-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{ backgroundColor: `${accent}20`, color: accent }}
        >
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
        <div className="min-w-0 flex-1">
          <h3 className="group-hover:text-primary truncate text-sm font-semibold transition">
            {team.name}
          </h3>
          <p className="text-muted-foreground truncate text-xs">
            <span className="font-mono">#{team.code}</span>
            <span className="mx-1.5">·</span>
            <span>{team.member_count ?? 0} thành viên</span>
          </p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </Card>
  );
}
