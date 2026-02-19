'use client';

import { useState } from 'react';
import { useMatchStore } from '@/stores/use-match-store';
import { GoalRecorder } from './PlayerPicker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Undo2, CircleStop, CirclePlus, CircleMinus } from 'lucide-react';
import { MOCK_PASSION_FC } from '@/lib/mock-data';
import type { PlayerSeason } from '@/types/match-scoring.types';

export function LiveMatchScoring() {
  const {
    liveMatch,
    addGoal,
    addAssist,
    addOpponentGoal,
    undoLastEvent,
    endMatch,
    resetLiveMatch,
  } = useMatchStore();

  const [goalRecorderOpen, setGoalRecorderOpen] = useState(false);
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);

  const team = MOCK_PASSION_FC;

  const handleGoalConfirm = (scorer: PlayerSeason, assister?: PlayerSeason) => {
    addGoal(scorer.id, scorer.name, scorer.code);
    if (assister) {
      addAssist(assister.id, assister.name, assister.code);
    }
  };

  // If no live match, return null (parent handles empty state or upcoming list)
  if (!liveMatch) return null;

  // Build paired event lines
  const goalEvents = liveMatch.events.filter((e) => e.type === 'goal');
  const assistEvents = liveMatch.events.filter((e) => e.type === 'assist');
  const eventLines: {
    scorer: string;
    scorerCode: number;
    assister?: string;
    assisterCode?: number;
    id: string;
  }[] = [];
  let aidx = 0;
  for (const g of goalEvents) {
    const a = aidx < assistEvents.length ? assistEvents[aidx] : undefined;
    if (
      a &&
      new Date(a.timestamp).getTime() - new Date(g.timestamp).getTime() < 5000
    ) {
      eventLines.push({
        id: g.id,
        scorer: g.playerName,
        scorerCode: g.playerCode,
        assister: a.playerName,
        assisterCode: a.playerCode,
      });
      aidx++;
    } else {
      eventLines.push({
        id: g.id,
        scorer: g.playerName,
        scorerCode: g.playerCode,
      });
    }
  }

  return (
    <div className="card-scoreboard">
      {/* ===== Scoreboard ===== */}
      <div className="px-5 pt-5 pb-4">
        {/* Live indicator */}
        <div className="mb-3 flex items-center justify-center gap-1.5">
          <div className="dot-live" />
          <span className="text-destructive text-[10px] font-bold tracking-[0.2em] uppercase">
            Trực tiếp
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-medium opacity-60">
              {team.name}
            </span>
            <span className="text-primary text-6xl leading-none font-black tabular-nums">
              {liveMatch.goalsScored}
            </span>
          </div>

          <span className="mt-4 text-xl font-light opacity-20">—</span>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-medium opacity-60">
              {liveMatch.opponent}
            </span>
            <span className="text-5xl leading-none font-black tabular-nums opacity-80">
              {liveMatch.goalsConceded}
            </span>
          </div>
        </div>

        <div className="text-muted-foreground mt-2 text-center text-[10px] opacity-40">
          {liveMatch.field}
        </div>
      </div>

      {/* ===== Action Buttons ===== */}
      <div className="flex gap-2 px-4 py-3">
        <Button
          onClick={() => setGoalRecorderOpen(true)}
          className="flex-1 gap-2 py-6 text-sm font-bold"
        >
          <CirclePlus className="h-5 w-5" />
          Ghi bàn
        </Button>

        <Button
          onClick={addOpponentGoal}
          variant="destructive"
          className="flex-1 gap-2 py-6 text-sm font-bold"
        >
          <CircleMinus className="h-5 w-5" />
          Đối thủ +1
        </Button>
      </div>

      {/* ===== Event Timeline ===== */}
      {(eventLines.length > 0 || liveMatch.goalsConceded > 0) && (
        <div className="border-t border-white/10 px-4 py-3">
          <div className="space-y-1.5">
            {[...eventLines].reverse().map((evt) => (
              <div
                key={evt.id}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs"
              >
                <span className="text-base">⚽</span>
                <span className="text-primary font-bold">
                  #{evt.scorerCode} {evt.scorer}
                </span>
                {evt.assister && (
                  <>
                    <span className="opacity-30">→</span>
                    <span className="text-accent font-medium">
                      👟 #{evt.assisterCode} {evt.assister}
                    </span>
                  </>
                )}
              </div>
            ))}

            {liveMatch.goalsConceded > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs">
                <span className="text-base">🔴</span>
                <span className="text-destructive font-medium">
                  {liveMatch.opponent} × {liveMatch.goalsConceded}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== Bottom Controls ===== */}
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5">
        <div className="flex gap-1">
          {(liveMatch.events.length > 0 || liveMatch.goalsConceded > 0) && (
            <button
              onClick={undoLastEvent}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs opacity-50 transition-opacity hover:opacity-80"
            >
              <Undo2 className="h-3 w-3" />
              Hoàn tác
            </button>
          )}
          <button
            onClick={() => resetLiveMatch()}
            className="text-destructive flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs opacity-50 transition-opacity hover:opacity-80"
          >
            Hủy
          </button>
        </div>

        <Dialog open={confirmEndOpen} onOpenChange={setConfirmEndOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-white/20">
              <CircleStop className="h-3.5 w-3.5" />
              Kết thúc
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle>Kết thúc trận đấu?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="text-center">
                <div className="text-3xl font-black">
                  <span className="text-primary">{liveMatch.goalsScored}</span>
                  <span className="text-muted-foreground mx-2">—</span>
                  <span>{liveMatch.goalsConceded}</span>
                </div>
                <div className="text-muted-foreground mt-1 text-sm">
                  vs {liveMatch.opponent}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmEndOpen(false)}
                >
                  Tiếp tục
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    endMatch();
                    setConfirmEndOpen(false);
                  }}
                >
                  Kết thúc
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goal Recorder */}
      <GoalRecorder
        open={goalRecorderOpen}
        onClose={() => setGoalRecorderOpen(false)}
        onConfirm={handleGoalConfirm}
      />
    </div>
  );
}
