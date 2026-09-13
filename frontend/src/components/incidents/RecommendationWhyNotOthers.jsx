import React from 'react';
import { HelpCircle, AlertTriangle, XCircle, ArrowDownRight } from 'lucide-react';

export function RecommendationWhyNotOthers({ comparisons = [] }) {
  if (!comparisons || comparisons.length === 0) return null;

  return (
    <div className="bg-[#121622] rounded-xl border border-[#1e2536] p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="p-1 rounded bg-blue-500/20 text-blue-400">
          <HelpCircle className="w-4 h-4" />
        </span>
        <h4 className="text-sm font-semibold text-slate-200">
          Why Not Other Alternatives?
        </h4>
      </div>

      <p className="text-xs text-slate-400">
        Transparent comparison against alternative catalog candidates that were ranked lower or disqualified by boundaries.
      </p>

      <div className="space-y-2 mt-2">
        {comparisons.map((item, idx) => {
          const isDisqualified = item.status === 'Not Applicable';
          const isConditional = item.status === 'Conditionally Applicable';

          return (
            <div
              key={idx}
              className="p-3 rounded-lg bg-[#151a28] border border-[#20283b] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">
                    {item.title}
                  </span>
                  <span
                    className={`px-2 py-0.2 text-[10px] font-semibold rounded-full ${
                      isDisqualified
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                        : isConditional
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {item.rationale}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span className="text-[11px] font-mono text-slate-400 bg-[#1e2538] px-2 py-0.5 rounded border border-slate-700">
                  {item.score_difference}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
