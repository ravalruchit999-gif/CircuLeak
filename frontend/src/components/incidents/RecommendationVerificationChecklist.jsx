import React from 'react';
import { ClipboardCheck, CheckSquare, Square } from 'lucide-react';

export function RecommendationVerificationChecklist({ checklist = [] }) {
  const [completedSteps, setCompletedSteps] = React.useState({});

  if (!checklist || checklist.length === 0) return null;

  const toggleStep = (stepNumber) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPct = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="bg-[#121622] rounded-xl border border-[#1e2536] p-5 space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-teal-500/20 text-teal-400">
            <ClipboardCheck className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">
              Plant Engineer Verification Checklist (Pre-Purchase / M&V)
            </h4>
            <p className="text-xs text-slate-400">
              Operational checklist required before capital commitment, vendor purchase order, or physical commissioning.
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="text-right shrink-0">
          <span className="text-xs font-semibold text-teal-300">
            {completedCount} of {checklist.length} Completed ({progressPct}%)
          </span>
          <div className="w-28 bg-[#1b2234] rounded-full h-1.5 mt-1 overflow-hidden ml-auto">
            <div
              className="h-1.5 rounded-full bg-teal-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2.5 mt-2">
        {checklist.map((item) => {
          const isDone = !!completedSteps[item.step];

          return (
            <div
              key={item.step}
              onClick={() => toggleStep(item.step)}
              className={`p-3.5 rounded-lg border transition-all duration-200 cursor-pointer flex items-start gap-3 text-xs ${
                isDone
                  ? 'bg-teal-950/20 border-teal-500/40 opacity-90'
                  : 'bg-[#151a28] border-[#20283b] hover:border-slate-600'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-teal-400 focus:outline-none shrink-0"
              >
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-teal-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-[#1e2538] text-teal-300 border border-teal-500/30">
                    Step {item.step} • {item.phase}
                  </span>
                  <span
                    className={`font-semibold ${
                      isDone ? 'line-through text-slate-400' : 'text-slate-200'
                    }`}
                  >
                    {item.action}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
