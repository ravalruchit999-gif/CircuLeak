import React from 'react';
import { CheckCircle2, ShieldAlert, AlertTriangle, HelpCircle } from 'lucide-react';

export function IncidentSupportedFactors({ supportedContributors = [], notConfirmed = [] }) {
  return (
    <div className="p-6 rounded-xl bg-[#121622] border border-[#1e2536] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold font-mono text-white tracking-wider uppercase">
              Supported Contributors vs. Physical Failure Boundaries
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Separating operational hypotheses supported by data from unconfirmed physical faults requiring field sensors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Supported Contributing Factors */}
        <div className="p-5 rounded-lg bg-[#0e121c] border border-emerald-500/20 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#1e2536]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
                Supported Contributing Factors (Data Confirmed)
              </h4>
            </div>

            {supportedContributors.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No specific operational factor confirmed by telemetry.</p>
            ) : (
              <div className="space-y-4">
                {supportedContributors.map((c, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-[#141a29] border border-[#1e2536]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">
                        {c.factor}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        {c.confidence} CONFIDENCE
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {c.explanation}
                    </p>

                    <div className="border-t border-[#1e2536]/80 pt-2">
                      <span className="text-[10px] font-mono text-slate-500 block mb-1">
                        Supporting Telemetry Signals:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {c.supporting_signals?.map((sig, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0a0d14] text-cyan-300 border border-cyan-500/30"
                          >
                            {sig}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Explicitly NOT Confirmed Physical Bounds */}
        <div className="p-5 rounded-lg bg-[#0e121c] border border-amber-500/20 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#1e2536]">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                Physical Failure Hypotheses (Explicitly NOT Confirmed)
              </h4>
            </div>

            {notConfirmed.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No unconfirmed physical hypotheses recorded.</p>
            ) : (
              <div className="space-y-4">
                {notConfirmed.map((nc, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-[#141a29] border border-[#1e2536]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">
                        {nc.factor}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        NOT CONFIRMED
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      <span className="text-amber-300/90 font-medium">Reason unconfirmed: </span>
                      {nc.reason_unconfirmed}
                    </p>

                    <div className="border-t border-[#1e2536]/80 pt-2">
                      <span className="text-[10px] font-mono text-slate-500 block mb-1">
                        Uninstrumented Physical Sensors:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {nc.missing_telemetry?.map((sensor, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0a0d14] text-amber-300 border border-amber-500/30"
                          >
                            {sensor}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncidentSupportedFactors;
