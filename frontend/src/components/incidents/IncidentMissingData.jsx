import React from 'react';
import { RadioTower, AlertTriangle, HelpCircle } from 'lucide-react';

export function IncidentMissingData({ missingData = [] }) {
  if (!missingData || missingData.length === 0) return null;

  return (
    <div className="p-6 rounded-xl bg-[#121622] border border-[#1e2536] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <RadioTower className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold font-mono text-white tracking-wider uppercase">
              Missing Telemetry Channels & Observability Limits
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transducers not instrumented on this asset that restrict deterministic root-cause confirmation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {missingData.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-[#0e121c] border border-amber-500/20 flex flex-col justify-between shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-white font-mono">
                  {item.telemetry_channel}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  MISSING
                </span>
              </div>

              <div className="mb-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  Diagnostic Value:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.why_it_matters}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded bg-[#141a29] border border-[#1e2536] text-[11px] font-mono text-slate-400 mt-2">
              <span className="text-amber-400 font-bold">Limit: </span>
              {item.operational_impact}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IncidentMissingData;
