'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOCK_MATCHES } from '@/lib/mock-data';
import { MatchCard } from '@/features/matches/components/MatchCard';

export default function MatchesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">TÌM ĐỐI</h1>
          <p className="text-muted-foreground text-sm">
            Các kèo đấu đang tìm đối thủ trong khu vực.
          </p>
        </div>
        <Button className="h-10 rounded-md px-4 text-sm font-medium">
          <Search className="mr-2 h-4 w-4" />
          Đăng tin tìm đối
        </Button>
      </div>

      {/* Matches List */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_MATCHES.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
