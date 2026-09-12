import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { ProgressBar } from '../ui/ProgressBar';

export function CircularityBreakdown({ pillars = [] }) {
  return (
    <SectionCard
      title="Circularity Pillar Assessment"
      subtitle="Evaluation across measurable operational dimensions vs unmeasured resource streams"
    >
      <div className="space-y-4">
        {pillars.map((pillar) => {
          const isUnavailable = pillar.status === 'unavailable' || pillar.current_score === null;

          return (
            <div
              key={pillar.id}
              className={`p-3.5 rounded border space-y-2 ${
                isUnavailable ? 'bg-[#10131b] border-[#1b212f] opacity-80' : 'bg-[#141822] border-[#212735]'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-100">{pillar.name}</span>
                  {isUnavailable ? (
                    <span className="text-[10px] text-amber-400/90 ml-2 font-mono px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/60">
                      Unmeasured Stream
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 ml-2 font-mono">
                      Weight: {pillar.weight}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 font-mono">
                  {isUnavailable ? (
                    <span className="text-slate-400 text-xs italic">Requires Data</span>
                  ) : (
                    <>
                      <span className="text-slate-200 font-bold">{pillar.current_score}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-emerald-400 font-bold">{pillar.projected_score}</span>
                      <span className="text-[10px] text-slate-400">/ 100</span>
                    </>
                  )}
                </div>
              </div>

              {!isUnavailable ? (
                <ProgressBar
                  value={pillar.current_score}
                  max={100}
                  variant={
                    pillar.current_score >= 70
                      ? 'emerald'
                      : pillar.current_score >= 50
                      ? 'blue'
                      : 'amber'
                  }
                />
              ) : (
                <div className="h-1.5 w-full bg-[#1b212f] rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700/40 w-full" />
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>{pillar.description}</span>
                <span className={`font-mono shrink-0 mt-0.5 sm:mt-0 ${isUnavailable ? 'text-slate-400' : 'text-emerald-400/90'}`}>
                  {isUnavailable ? pillar.key_leverage : `Lever: ${pillar.key_leverage}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
