import React from 'react';
import { HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';

export function LeakExplanation({ leak }) {
  if (!leak) return null;

  return (
    <SectionCard
      title="Diagnostic Explanation: Why Was This Flagged?"
      subtitle="Automated anomaly analysis based on observed operating data vs expected baseline"
      className="border-red-950/60"
      badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
          Root Cause Analysis
        </span>
      }
    >
      {/* 5-Metric Visual Comparison Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded bg-[#161a24] border border-[#263042] mb-4 text-xs font-mono">
        <div>
          <span className="text-[10px] uppercase text-slate-400 block">Expected Baseline</span>
          <span className="text-sm font-semibold text-slate-200">
            {leak.baseline_consumption} {leak.consumption_unit}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase text-slate-400 block">Observed Operating</span>
          <span className="text-sm font-semibold text-red-400">
            {leak.observed_consumption} {leak.consumption_unit}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase text-slate-400 block">Deviation</span>
          <span className="text-sm font-semibold text-red-400">
            +{leak.deviation_percent}%
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase text-slate-400 block">Abnormal Period</span>
          <span className="text-sm font-semibold text-amber-300 truncate">
            {leak.abnormal_period}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase text-slate-400 block">Production State</span>
          <span className="text-sm font-semibold text-slate-300">
            {leak.production_status}
          </span>
        </div>
      </div>

      {/* Backend Explanation Narrative */}
      <div className="p-4 rounded bg-red-950/20 border border-red-900/40 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-red-200 uppercase tracking-wider mb-1">
              Backend Diagnostic Intelligence
            </h4>
            <p className="text-xs text-red-200 leading-relaxed font-mono">
              "{leak.reason}"
            </p>
          </div>
        </div>
      </div>

      {/* Potential Causes */}
      {leak.potential_causes && leak.potential_causes.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Identified Contributing Factors
          </h5>
          <div className="space-y-1.5">
            {leak.potential_causes.map((cause, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-300 p-2 rounded bg-[#141822] border border-[#212735]"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{cause}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
