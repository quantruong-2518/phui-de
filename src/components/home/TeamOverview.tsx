import { Trophy, Users, Target, TrendingUp, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TeamOverviewProps {
  team: {
    name: string;
    code: string;
  };
  role: {
    label: string;
    icon: string;
  };
  approval?: {
    status: 'pending' | 'approved' | 'rejected';
  };
  memberName?: string;
}

export function TeamOverview({
  team,
  role,
  approval,
  memberName = 'Bạn',
}: TeamOverviewProps) {
  // Mock data - replace with real API
  const stats = {
    members: 25,
    wins: 12,
    losses: 5,
    goals: 48,
    assists: 32,
  };

  const isVerified = approval?.status === 'approved';

  return (
    <div className="space-y-3">
      {/* Team Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-bold">
            {team.name}{' '}
            <span className="text-muted-foreground">#{team.code}</span>
          </h2>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="text-muted-foreground text-xs">{memberName}</span>
            <span className="text-muted-foreground text-xs">-</span>
            <Badge
              variant={isVerified ? 'default' : 'secondary'}
              className={`h-5 px-1.5 py-0 text-[10px] ${isVerified ? 'bg-primary' : ''}`}
            >
              {role.label}
            </Badge>
            {isVerified && (
              <Star className="text-primary fill-primary h-3.5 w-3.5" />
            )}
          </div>
        </div>
        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
          <Trophy className="text-primary h-6 w-6" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <Users className="text-muted-foreground mx-auto mb-1 h-4 w-4" />
          <div className="text-sm font-bold">{stats.members}</div>
          <div className="text-muted-foreground text-[10px]">Thành viên</div>
        </div>
        <div className="bg-primary/10 rounded-lg p-2 text-center">
          <Trophy className="text-primary mx-auto mb-1 h-4 w-4" />
          <div className="text-primary text-sm font-bold">{stats.wins}</div>
          <div className="text-muted-foreground text-[10px]">Thắng</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <Target className="text-muted-foreground mx-auto mb-1 h-4 w-4" />
          <div className="text-sm font-bold">{stats.goals}</div>
          <div className="text-muted-foreground text-[10px]">Bàn thắng</div>
        </div>
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <TrendingUp className="text-muted-foreground mx-auto mb-1 h-4 w-4" />
          <div className="text-sm font-bold">{stats.assists}</div>
          <div className="text-muted-foreground text-[10px]">Kiến tạo</div>
        </div>
      </div>
    </div>
  );
}
