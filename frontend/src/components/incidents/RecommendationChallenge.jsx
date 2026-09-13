import React from 'react';
import { AlertOctagon, ShieldAlert, CheckCheck, HelpCircle } from 'lucide-react';

export function RecommendationChallenge({ challengeData }) {
  if (!challengeData || challengeData.status === 'No recommendation to challenge') {
    return null;
  }

  const { critical_counterarguments, failure_modes_and_mitigations, what_could_disprove_this } = challengeData;

  return (
    <div className="bg-[#121622] rounded-xl border border-rose-900/30 p-5 space-y-4 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="p-1 rounded bg-rose-500/20 text-rose-400">
          <AlertOctagon className="w-4 h-4" />
        </span>
        <div>
          <h4 className="text-sm font-semibold text-slate-200">
            Challenge My Recommendation (Adversarial Engineering Review)
          </h4>
          <p className="text-xs text-slate-400">
            Proactively stress-tests this proposal against potential failure modes, operational edge cases, and disproving evidence.
          </p>
        </div>
      </div>

      {/* Critical Counterarguments */}
      {critical_counterarguments && critical_counterarguments.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-rose-300 block uppercase tracking-wider">
            Critical Engineering Challenges:
          </span>
          <div className="space-y-1.5">
            {critical_counterarguments.map((arg, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs text-slate-300 leading-relaxed flex items-start gap-2"
              >
                <span className="text-rose-400 font-bold text-xs shrink-0">#{idx + 1}</span>
                <span>{arg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failure Modes & Mitigations Table/Cards */}
      {failure_modes_and_mitigations && failure_modes_and_mitigations.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#1e2536]">
          <span className="text-xs font-semibold text-amber-300 block uppercase tracking-wider">
            Potential Failure Modes & Verified Mitigations:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {failure_modes_and_mitigations.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#141926] border border-[#20283b] space-y-2 text-xs"
              >
                <div className="flex items-start gap-2 text-rose-300">
                  <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-400" />
                  <span className="font-medium text-[11px] leading-snug">{item.failure_mode}</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-300 pt-1 border-t border-[#1e2536]">
                  <CheckCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
                  <span className="text-slate-300 text-[11px] leading-snug">{item.mitigation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What could disprove this */}
      {what_could_disprove_this && (
        <div className="p-3 rounded-lg bg-[#0e121c] border border-[#20283b] text-xs text-slate-300 space-y-1">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            What Empirical Data Could Disprove This Recommendation?
          </span>
          <p className="text-[11px] text-slate-300 leading-relaxed pl-5">
            {what_could_disprove_this}
          </p>
        </div>
      )}
    </div>
  );
}
