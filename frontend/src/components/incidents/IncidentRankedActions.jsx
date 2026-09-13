import React from 'react';
import { ListOrdered, ArrowRight, Zap, Target } from 'lucide-react';

const PRIORITY_BADGES = {
  HIGH: {
    label: 'HIGH PRIORITY',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400'
  },
  MEDIUM: {
    label: 'MEDIUM PRIORITY',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400'
  },
  LOW: {
    label: 'LOW PRIORITY',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    text: 'text-slate-400'
  }
};

export function IncidentRankedActions({ rankedActions = [] }) {
  if (!rankedActions || rankedActions.length === 0) return null;

  return (
    <div className="p-6 rounded-xl bg-[#121622] border border-[#1e2536] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold font-mono text-white tracking-wider uppercase">
              Ranked Next Investigation Actions
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ordered by expected information gain to disambiguate root causes with minimal plant disruption.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {rankedActions.map((action, idx) => {
          const priority = PRIORITY_BADGES[action.investigation_priority] || PRIORITY_BADGES.MEDIUM;

          return (
            <div
              key={idx}
              className="p-4 rounded-lg bg-[#0e121c] border border-[#1e2536] hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                    #{idx + 1}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${priority.bg} ${priority.border} ${priority.text}`}>
                    {priority.label}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Target className="w-3 h-3 text-slate-500" />
                    Target: {action.target_equipment}
                  </span>
                </div>

                <div className="text-sm font-semibold text-white">
                  {action.action}
                </div>

                <div className="text-xs text-slate-400 leading-relaxed">
                  <span className="text-cyan-400/90 font-mono font-bold">Information Gain: </span>
                  {action.information_gain_rationale}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#141a29] border border-[#1e2536] text-slate-300">
                  {action.action_type || 'Field Verification'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IncidentRankedActions;
