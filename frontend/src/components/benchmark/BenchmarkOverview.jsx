import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';

export function BenchmarkOverview({ benchmark }) {
  if (!benchmark) return null;

  return (
    <SectionCard
      title="Regional Industry Benchmark Assessment"
      subtitle="Evaluation of facility performance relative to regional manufacturing cohort"
      className="h-full flex flex-col"
      badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-semibold">
          {benchmark.performance}
        </span>
      }
    >
      <div className="space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="p-3.5 rounded bg-[#161a24] border border-[#263042]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1">
                Benchmark Comparative Diagnostic
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                {benchmark.status_summary}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
          <div className="p-3 rounded bg-[#131620] border border-[#202737]">
            <span className="text-[10px] text-slate-400 uppercase block">This Facility</span>
            <span className="text-lg font-bold text-red-400">
              {benchmark.facility_intensity}
            </span>
            <span className="text-[10px] text-slate-400 block">kgCO₂e / ton</span>
          </div>

          <div className="p-3 rounded bg-[#131620] border border-[#202737]">
            <span className="text-[10px] text-slate-400 uppercase block">Industry Average</span>
            <span className="text-lg font-bold text-slate-200">
              {benchmark.benchmark_average}
            </span>
            <span className="text-[10px] text-slate-400 block">kgCO₂e / ton</span>
          </div>

          <div className="p-3 rounded bg-[#131620] border border-[#202737]">
            <span className="text-[10px] text-slate-400 uppercase block">Performance Gap</span>
            <span className="text-lg font-bold text-red-400">
              +{benchmark.difference_percent}%
            </span>
            <span className="text-[10px] text-slate-400 block">Higher Intensity</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-[#1f2635]">
          <span>Facility Percentile: <strong>68th Percentile (High Intensity)</strong></span>
          <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> Target: 25th Quartile (75.4 kg/t)
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
