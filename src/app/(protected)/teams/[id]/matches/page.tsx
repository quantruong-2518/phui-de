'use client';

import { MatchHistory } from '@/components/match/MatchHistory';
import { UpcomingMatches } from '@/components/match/UpcomingMatches';
import { useMatchStore } from '@/stores/use-match-store';

export default function TeamMatchesPage() {
  const { liveMatch } = useMatchStore();

  return (
    <div className="animate-in fade-in-50 space-y-8 duration-500">
      {/* Upcoming Matches Section */}
      <section className="space-y-4">
        {/* If live match is active, we might want to hide upcoming or show it differently. 
            For now, showing it ensures user can see future schedule even during a match 
            (unlike Dashboard where focus is strict). 
            But `UpcomingMatches` has logic to hide start button if not today.
        */}
        <UpcomingMatches />
      </section>

      {/* Match History Section */}
      <section>
        <MatchHistory />
      </section>
    </div>
  );
}
