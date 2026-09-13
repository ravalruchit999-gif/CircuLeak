import React from 'react';
import { Compass, CheckCircle2, XCircle } from 'lucide-react';

export function IncidentHypothesisFalsification({ falsifications = [] }) {
  if (!falsifications || falsifications.length === 0) return null;

  return (
    <div className="p-6 rounded-xl bg-[#121622] border border-[#1e2536] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold font-mono text-white tracking-wider uppercase">
              What Would Change Our Conclusion? (Hypothesis Falsification)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Scientific falsifiability criteria specifying exact field conditions that would confirm or invalidate this operational hypothesis.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {falsifications.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-[#0e121c] border border-[#1e2536] shadow-md"
          >
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1e2536]">
              <span className="text-xs font-mono text-slate-500 uppercase">Working Hypothesis:</span>
              <span className="text-xs font-bold text-white font-mono">
                {item.hypothesis}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengthening Condition */}
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  STRENGTHENING CONDITION
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.strengthening_condition}
                </p>
              </div>

              {/* Falsifying Condition */}
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 mb-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  FALSIFYING CONDITION (REFUTATION)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.falsifying_condition}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IncidentHypothesisFalsification;
