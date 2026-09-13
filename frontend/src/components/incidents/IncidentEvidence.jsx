import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, ShieldAlert } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';

export function IncidentEvidence({ evidence = [], contributingFactors = [] }) {
  const hasEvidence = Array.isArray(evidence) && evidence.length > 0;
  const hasFactors = Array.isArray(contributingFactors) && contributingFactors.length > 0;

  return (
    <SectionCard
      title="WHY WAS THIS FLAGGED?"
      subtitle="Defensible evidence signals and statistical anomalies extracted by backend analysis"
      className="mb-6"
      badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800">
          EVIDENCE AUDIT
        </span>
      }
    >
      {/* Evidence Signals List */}
      <div className="space-y-2.5 mb-6">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          SUPPORTING DETECTION SIGNALS
        </h4>

        {hasEvidence ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {evidence.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#141824] border border-[#222b3e] flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 font-mono">
                    {item.signal}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-[#121622] border border-[#1e2536] text-xs text-slate-400">
            No discrete supporting signals recorded for this incident.
          </div>
        )}
      </div>

      {/* Possible Contributing Factors */}
      <div className="pt-4 border-t border-[#1c2333]">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2.5">
          POSSIBLE CONTRIBUTING FACTORS
        </h4>

        {hasFactors ? (
          <div className="space-y-2">
            {contributingFactors.map((factor, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#141824] border border-[#222b3e] text-xs text-slate-300"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3.5 rounded-lg bg-[#121622] border border-[#1e2536] text-xs text-slate-400 font-mono flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Potential contributing factors cannot be determined from the current dataset. Further operational investigation is required.
            </span>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
