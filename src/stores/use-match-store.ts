import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { LiveMatch, MatchEvent, MatchRecord, MatchResult } from '@/types/match-scoring.types';

interface MatchStoreState {
  // Live match
  liveMatch: LiveMatch | null;
  // Match history (persisted)
  matchHistory: MatchRecord[];

  // Actions
  startMatch: (opponent: string, field: string) => void;
  addGoal: (playerId: string, playerName: string, playerCode: number) => void;
  addAssist: (playerId: string, playerName: string, playerCode: number) => void;
  addOpponentGoal: () => void;
  undoLastEvent: () => void;
  endMatch: () => void;
  resetLiveMatch: () => void;
}

let eventCounter = 0;

export const useMatchStore = create<MatchStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        liveMatch: null,
        matchHistory: [],

        startMatch: (opponent, field) => {
          const match: LiveMatch = {
            id: `live-${Date.now()}`,
            opponent,
            field,
            startTime: new Date().toISOString(),
            status: 'live',
            goalsScored: 0,
            goalsConceded: 0,
            events: [],
          };
          set({ liveMatch: match });
        },

        addGoal: (playerId, playerName, playerCode) => {
          const { liveMatch } = get();
          if (!liveMatch) return;

          const event: MatchEvent = {
            id: `evt-${++eventCounter}`,
            matchId: liveMatch.id,
            playerId,
            playerName,
            playerCode,
            type: 'goal',
            timestamp: new Date().toISOString(),
          };

          set({
            liveMatch: {
              ...liveMatch,
              goalsScored: liveMatch.goalsScored + 1,
              events: [...liveMatch.events, event],
            },
          });
        },

        addAssist: (playerId, playerName, playerCode) => {
          const { liveMatch } = get();
          if (!liveMatch) return;

          const event: MatchEvent = {
            id: `evt-${++eventCounter}`,
            matchId: liveMatch.id,
            playerId,
            playerName,
            playerCode,
            type: 'assist',
            timestamp: new Date().toISOString(),
          };

          set({
            liveMatch: {
              ...liveMatch,
              events: [...liveMatch.events, event],
            },
          });
        },

        addOpponentGoal: () => {
          const { liveMatch } = get();
          if (!liveMatch) return;

          set({
            liveMatch: {
              ...liveMatch,
              goalsConceded: liveMatch.goalsConceded + 1,
            },
          });
        },

        undoLastEvent: () => {
          const { liveMatch } = get();
          if (!liveMatch || liveMatch.events.length === 0) return;

          const lastEvent = liveMatch.events[liveMatch.events.length - 1];
          const newEvents = liveMatch.events.slice(0, -1);

          set({
            liveMatch: {
              ...liveMatch,
              goalsScored:
                lastEvent.type === 'goal'
                  ? liveMatch.goalsScored - 1
                  : liveMatch.goalsScored,
              events: newEvents,
            },
          });
        },

        endMatch: () => {
          const { liveMatch, matchHistory } = get();
          if (!liveMatch) return;

          let result: MatchResult = 'D';
          if (liveMatch.goalsScored > liveMatch.goalsConceded) result = 'W';
          else if (liveMatch.goalsScored < liveMatch.goalsConceded) result = 'L';

          const record: MatchRecord = {
            id: liveMatch.id,
            opponent: liveMatch.opponent,
            field: liveMatch.field,
            date: new Date().toISOString().split('T')[0],
            goalsScored: liveMatch.goalsScored,
            goalsConceded: liveMatch.goalsConceded,
            result,
            events: liveMatch.events,
          };

          set({
            liveMatch: null,
            matchHistory: [...matchHistory, record],
          });
        },

        resetLiveMatch: () => {
          set({ liveMatch: null });
        },
      }),
      { name: 'passion-match-store' },
    ),
    { name: 'match-store' },
  ),
);
