import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { Zap, CheckCircle, Clock } from 'lucide-react';

export function PriorityMatrix({ matrix }) {
  const highImpactLowEffort = matrix?.high_impact_low_effort || [];
  const highImpactHighEffort = matrix?.high_impact_high_effort || [];

  return (
    <SectionCard
      title="Intervention Priority Matrix"
      subtitle="Backend ranked prioritization based on marginal abatement cost and execution feasibility"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quadrant 1: High Impact / Low Effort (Quick Wins) */}
        <div className="p-4 rounded bg-[#151c27] border border-emerald-800/40 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                Immediate Wins (High Impact / Low Effort)
              </h4>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Top Priority
            </span>
          </div>

          <div className="space-y-2">
            {highImpactLowEffort.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded bg-[#10141d] border border-[#232d3d] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-200 font-medium">{item.title}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  Score {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 2: High Impact / Higher Effort (Strategic Investments) */}
        <div className="p-4 rounded bg-[#181926] border border-blue-800/40 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Strategic Assets (High Impact / Medium Effort)
              </h4>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              Phase 2
            </span>
          </div>

          <div className="space-y-2">
            {highImpactHighEffort.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded bg-[#10141d] border border-[#232d3d] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-slate-200 font-medium">{item.title}</span>
                </div>
                <span className="text-[10px] font-mono text-blue-400 font-bold">
                  Score {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
