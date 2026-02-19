'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, Users } from 'lucide-react';
import { useTeams } from '@/features/teams/hooks/use-teams';

interface TeamSelectionStepProps {
  onNext: (
    status: 'team_member' | 'free_agent',
    team?: { id: string; name: string; code: string },
  ) => void;
}

export function TeamSelectionStep({ onNext }: TeamSelectionStepProps) {
  const [mode, setMode] = useState<'select' | 'search'>('select');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real teams from API
  const { data: teamsData, isLoading, error } = useTeams(searchQuery);
  const teams = teamsData || [];

  if (mode === 'search') {
    return (
      <div className="flex h-full w-full flex-col">
        {/* Content area - scrollable */}
        <div className="flex-1 space-y-4 overflow-y-auto pb-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Tìm Đội Của Bạn</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Tìm theo tên đội hoặc mã đội
            </p>
          </div>

          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Tìm theo tên hoặc mã (vd: #TOJI001)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 border-2 pl-10"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="text-muted-foreground py-12 text-center text-sm">
                <div className="mb-2">Đang tìm kiếm...</div>
                <div className="bg-muted mx-auto h-2 w-32 animate-pulse rounded" />
              </div>
            ) : error ? (
              <div className="text-destructive py-12 text-center text-sm">
                <div className="mb-2">Lỗi khi tải dữ liệu</div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-primary hover:underline"
                >
                  Thử lại
                </button>
              </div>
            ) : teams.length > 0 ? (
              teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() =>
                    onNext('team_member', {
                      id: team.id,
                      name: team.name,
                      code: team.code,
                    })
                  }
                  className="bg-muted/30 hover:bg-primary/5 group w-full rounded-xl p-4 text-left transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    {/* Team Logo */}
                    <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-transform group-hover:scale-110">
                      {team.logo_url ? (
                        <img
                          src={team.logo_url}
                          alt={team.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        '⚽'
                      )}
                    </div>

                    {/* Team Info */}
                    <div className="flex-1">
                      <div className="group-hover:text-primary text-base font-bold transition-colors">
                        {team.name}
                      </div>
                      <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-sm">
                        <span className="font-mono">#{team.code}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{team.member_count || 0}</span>
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-all group-hover:translate-x-1" />
                  </div>
                </button>
              ))
            ) : (
              <div className="text-muted-foreground py-12 text-center text-sm">
                Không tìm thấy đội nào
              </div>
            )}
          </div>
        </div>

        {/* Floating Navigation */}
        <div className="bg-background/95 fixed right-0 bottom-0 left-0 px-4 py-6 backdrop-blur-md">
          <div className="mx-auto max-w-2xl">
            <Button
              variant="outline"
              onClick={() => setMode('select')}
              className="w-full border-2"
            >
              ← Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="grid gap-3">
        <button
          onClick={() => setMode('search')}
          className="bg-primary/5 hover:bg-primary/10 group w-full rounded-xl p-5 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 group-hover:bg-primary flex h-14 w-14 items-center justify-center rounded-xl transition-all group-hover:scale-110">
              <span className="text-3xl">👥</span>
            </div>
            <div className="flex-1">
              <div className="group-hover:text-primary text-lg font-bold transition-colors">
                Tham Gia Đội
              </div>
              <div className="text-muted-foreground text-sm">
                Tìm đội bạn đang chơi
              </div>
            </div>
            <ArrowRight className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-all group-hover:translate-x-1" />
          </div>
        </button>

        <button
          onClick={() => onNext('free_agent')}
          className="bg-accent/5 hover:bg-accent/10 group w-full rounded-xl p-5 text-left transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="bg-accent/10 group-hover:bg-accent flex h-14 w-14 items-center justify-center rounded-xl transition-all group-hover:scale-110">
              <span className="text-3xl">⚡</span>
            </div>
            <div className="flex-1">
              <div className="group-hover:text-accent text-lg font-bold transition-colors">
                Cầu Thủ Tự Do
              </div>
              <div className="text-muted-foreground text-sm">
                Chưa có đội cố định
              </div>
            </div>
            <ArrowRight className="text-muted-foreground group-hover:text-accent h-5 w-5 transition-all group-hover:translate-x-1" />
          </div>
        </button>
      </div>
    </div>
  );
}
