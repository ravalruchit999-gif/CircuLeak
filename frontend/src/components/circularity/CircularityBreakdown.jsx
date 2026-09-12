import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { ProgressBar } from '../ui/ProgressBar';

export function CircularityBreakdown({ pillars = [] }) {
  return (
    <SectionCard
      title="Circularity Pillar Assessment"
      subtitle="Evaluation across the 5 core dimensions of industrial circular manufacturing"
    >
      <div className="space-y-4">
        {pillars.map((pillar) => (
          <div
            key={pillar.id}
            className="p-3.5 rounded bg-[#141822] border border-[#212735] space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-100">{pillar.name}</span>
                <span className="text-[10px] text-slate-400 ml-2 font-mono">
                  Weight: {pillar.weight}%
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-200 font-bold">{pillar.current_score}</span>
                <span className="text-slate-400">→</span>
                <span className="text-emerald-400 font-bold">{pillar.projected_score}</span>
                <span className="text-[10px] text-slate-400">/ 100</span>
              </div>
            </div>

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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>{pillar.description}</span>
              <span className="font-mono text-emerald-400/90 shrink-0 mt-0.5 sm:mt-0">
                Lever: {pillar.key_leverage}
              </span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
