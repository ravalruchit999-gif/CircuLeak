import React from 'react';
import { RefreshCw, Award, ArrowUpRight } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';

export function CircularityScore({ overallScore = 64, projectedScore = 83, tier = 'Transitioning Circular' }) {
  const delta = projectedScore - overallScore;

  return (
    <SectionCard
      title="Circularity Performance Index"
      subtitle="Comprehensive 0–100 circular economy rating across plant material, thermal, and energy lifecycles"
    >
      <div className="p-5 rounded bg-[#151a24] border border-[#232b3b] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Circular Dial Visualizer */}
          <div className="relative w-24 h-24 rounded-full border-4 border-[#232d3e] flex flex-col items-center justify-center bg-[#11141b] shrink-0">
            <span className="text-3xl font-mono font-bold text-white leading-none">
              {overallScore}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-1">/ 100</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Performance Tier
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {tier}
              </span>
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Baseline Circularity Rating
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Score derived from raw material recyclability, closed-loop thermal recapture, and auxiliary pumping energy efficiency.
            </p>
          </div>
        </div>

        {/* Projected Score Delta */}
        <div className="text-right sm:border-l sm:border-[#202737] sm:pl-6 shrink-0">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Projected With Interventions
          </span>
          <div className="flex items-baseline gap-1.5 justify-end mt-0.5">
            <span className="text-3xl font-mono font-bold text-emerald-400">
              {projectedScore}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              (+{delta} pts)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">
            Reaches "Advanced Circular"
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
