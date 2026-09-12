import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export function InterventionTimeline({ phases = [] }) {
  return (
    <SectionCard
      title="Phased Implementation Roadmap"
      subtitle="Execution sequence structured by operational complexity, capital allocation, and ROI payback"
    >
      <div className="space-y-4">
        {phases.map((phase, idx) => (
          <div
            key={phase.phase}
            className="p-4 rounded bg-[#141822] border border-[#212837] relative"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-[#1c2331]">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px] flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <h4 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">
                  {phase.phase}
                </h4>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">
                  Capex: <strong className="text-slate-200">{formatCurrency(phase.total_capex)}</strong>
                </span>
                <span className="text-slate-400">
                  Savings: <strong className="text-emerald-400">{formatCurrency(phase.total_annual_savings)}/yr</strong>
                </span>
              </div>
            </div>

            <div className="space-y-1.5 mt-2">
              {phase.interventions.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
