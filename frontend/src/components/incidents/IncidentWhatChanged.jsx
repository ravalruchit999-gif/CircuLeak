import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Scale, AlertCircle } from 'lucide-react';

const TIER_BADGES = {
  'Tier 1': {
    label: 'Tier 1: Same Asset & Process State',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400'
  },
  'Tier 2': {
    label: 'Tier 2: Same Shift / Hour Baseline',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    dot: 'bg-cyan-400'
  },
  'Tier 3': {
    label: 'Tier 3: Historical Median Baseline',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    dot: 'bg-indigo-400'
  },
  'baseline_unavailable': {
    label: 'Baseline Unavailable',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    text: 'text-zinc-400',
    dot: 'bg-zinc-400'
  }
};

export function IncidentWhatChanged({ whatChanged = [] }) {
  if (!whatChanged || whatChanged.length === 0) return null;

  return (
    <div className="p-6 rounded-xl bg-[#121622] border border-[#1e2536] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold font-mono text-white tracking-wider uppercase">
              Measured What Changed (Baseline Comparison)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic divergence comparing measured incident telemetry against calibrated operating baselines.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e2536] text-[11px] font-mono uppercase text-slate-400">
              <th className="py-3 px-3">Telemetry Metric</th>
              <th className="py-3 px-3 text-right">Observed Window</th>
              <th className="py-3 px-3 text-right">Calibrated Baseline</th>
              <th className="py-3 px-3 text-right">Absolute Shift</th>
              <th className="py-3 px-3 text-right">Divergence %</th>
              <th className="py-3 px-3">Baseline Quality Hierarchy</th>
              <th className="py-3 px-3">Operational Interpretation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2536]/60 text-xs">
            {whatChanged.map((item, idx) => {
              const diff = item.difference !== null && item.difference !== undefined ? item.difference : 0;
              const isPositive = diff > 0;
              const isNegative = diff < 0;

              // Match tier badge
              let tierConfig = TIER_BADGES['Tier 3'];
              if (item.baseline_method_tier) {
                if (item.baseline_method_tier.includes('Tier 1')) tierConfig = TIER_BADGES['Tier 1'];
                else if (item.baseline_method_tier.includes('Tier 2')) tierConfig = TIER_BADGES['Tier 2'];
                else if (item.baseline_method_tier.includes('unavailable')) tierConfig = TIER_BADGES['baseline_unavailable'];
              }

              return (
                <tr key={idx} className="hover:bg-[#161c2c]/50 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {item.metric}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                    {item.observed !== null ? `${item.observed} ${item.unit}` : 'N/A'}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono text-slate-400">
                    {item.baseline !== null ? `${item.baseline} ${item.unit}` : 'N/A'}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        isPositive ? 'text-amber-400' : isNegative ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : isNegative ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3 h-3" />}
                      {diff > 0 ? `+${diff}` : diff} {item.unit}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        item.difference_percent > 20
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : item.difference_percent > 0
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {item.difference_percent !== null ? `${item.difference_percent > 0 ? '+' : ''}${item.difference_percent}%` : 'N/A'}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-mono font-medium ${tierConfig.bg} ${tierConfig.border} ${tierConfig.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tierConfig.dot}`} />
                      {tierConfig.label}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-400 text-[11px] max-w-xs leading-relaxed">
                    {item.interpretation}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IncidentWhatChanged;
