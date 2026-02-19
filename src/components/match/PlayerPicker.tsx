'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MOCK_PASSION_FC_PLAYERS } from '@/lib/mock-data';
import type { PlayerSeason } from '@/types/match-scoring.types';
import { ArrowLeft, SkipForward } from 'lucide-react';

interface GoalRecorderProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (scorer: PlayerSeason, assister?: PlayerSeason) => void;
}

export function GoalRecorder({ open, onClose, onConfirm }: GoalRecorderProps) {
  const [step, setStep] = useState<'scorer' | 'assister'>('scorer');
  const [scorer, setScorer] = useState<PlayerSeason | null>(null);
  const players = MOCK_PASSION_FC_PLAYERS;

  const handleSelectScorer = (player: PlayerSeason) => {
    setScorer(player);
    setStep('assister');
  };

  const handleSelectAssister = (player: PlayerSeason) => {
    if (scorer) onConfirm(scorer, player);
    handleReset();
  };

  const handleSkipAssist = () => {
    if (scorer) onConfirm(scorer);
    handleReset();
  };

  const handleReset = () => {
    setStep('scorer');
    setScorer(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleReset();
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-sm overflow-y-auto p-0">
        {/* Header with gradient */}
        <DialogHeader className="border-border border-b px-5 pt-5 pb-3">
          <DialogTitle className="text-center text-base font-bold">
            {step === 'scorer' ? '⚽ Ai ghi bàn?' : '👟 Ai kiến tạo?'}
          </DialogTitle>
          {step === 'assister' && scorer && (
            <p className="text-primary text-center text-xs font-medium">
              ⚽ #{scorer.code} {scorer.name} đã ghi bàn
            </p>
          )}
        </DialogHeader>

        {/* Step indicator — primary/accent gradient */}
        <div className="flex items-center gap-2 px-5 pt-2">
          <div
            className={`h-1.5 flex-1 rounded-full transition-all ${
              step === 'scorer' ? 'bg-primary' : 'bg-primary'
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full transition-all ${
              step === 'assister' ? 'bg-accent' : 'bg-muted'
            }`}
          />
        </div>

        {/* Player Grid */}
        <div className="grid grid-cols-4 gap-2 p-4">
          {players.map((player) => {
            const isScorer = scorer?.id === player.id;
            const isDisabled = step === 'assister' && isScorer;

            return (
              <button
                key={player.id}
                disabled={isDisabled}
                onClick={() =>
                  step === 'scorer'
                    ? handleSelectScorer(player)
                    : handleSelectAssister(player)
                }
                className={`flex flex-col items-center gap-0.5 rounded-xl border-2 p-2.5 transition-all active:scale-90 ${
                  isDisabled
                    ? 'border-border cursor-not-allowed opacity-25'
                    : isScorer
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <span className="text-primary text-2xl font-black tabular-nums">
                  {player.code}
                </span>
                <span className="text-muted-foreground max-w-full truncate text-[10px] font-medium">
                  {player.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom actions */}
        {step === 'assister' && (
          <div className="border-border flex gap-2 border-t px-5 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep('scorer');
                setScorer(null);
              }}
              className="flex-1 gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Chọn lại
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSkipAssist}
              className="flex-1 gap-1"
            >
              Bỏ qua
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
