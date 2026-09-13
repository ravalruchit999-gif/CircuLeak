import React from 'react';
import { GitCommit, AlertCircle, TrendingUp, Info } from 'lucide-react';

export function IncidentMultivariable({ multivariableAnalysis = [] }) {
  if (!multivariableAnalysis || multivariableAnalysis.length === 0) return null;

  return (
    <div className="p-6 rounded-xl bg-[#121622] border border-[#1e2536] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold font-mono text-white tracking-wider uppercase">
              Multivariable Telemetry Association Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Timestamp-aligned paired correlation analysis with zero-variance guards and strict non-causal boundaries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {multivariableAnalysis.map((assoc, idx) => {
          const hasR = assoc.association_r !== null && assoc.association_r !== undefined;

          return (
            <div
              key={idx}
              className="p-4 rounded-lg bg-[#0e121c] border border-[#1e2536] flex flex-col justify-between shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-xs font-bold text-white font-mono">
                    {assoc.variable_a} <span className="text-cyan-400">↔</span> {assoc.variable_b}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    N = {assoc.sample_size}
                  </span>
                </div>

                {/* Metric Value */}
                <div className="my-3 p-3 rounded-lg bg-[#141a29] border border-[#1e2536] flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Linear Association (Pearson r):
                  </span>
                  <span
                    className={`font-mono text-base font-bold ${
                      hasR ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  >
                    {hasR ? `r = ${assoc.association_r}` : 'Undefined / Suppressed'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {assoc.note}
                </p>
              </div>

              {/* Scientific Caveat */}
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-[10px] font-mono text-slate-400 leading-relaxed">
                  {assoc.caveat}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IncidentMultivariable;
