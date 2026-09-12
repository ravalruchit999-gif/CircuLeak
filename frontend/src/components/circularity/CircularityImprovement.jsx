import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export function CircularityImprovement({ delta = 19 }) {
  return (
    <SectionCard
      title="Circularity Enhancement Pathway"
      subtitle="Anticipated maturity progression following execution of flagged recommendations"
    >
      <div className="p-4 rounded bg-[#151a24] border border-[#232b3b] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Maturity Level Shift
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Completing the 4 prioritized interventions advances the plant index from{' '}
              <strong className="text-slate-100">64 (Transitioning)</strong> to{' '}
              <strong className="text-emerald-400">83 (Advanced Circular)</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono text-emerald-300 font-semibold">
            +19 Points Uplift
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
