import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export function RecommendationWhyThis({ points = [] }) {
  if (!points || points.length === 0) return null;

  return (
    <div className="bg-[#121622] rounded-xl border border-[#1e2536] p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
        </span>
        <h4 className="text-sm font-semibold text-slate-200">
          Why This Option Fits This Specific Incident
        </h4>
      </div>

      <p className="text-xs text-slate-400">
        Engineered alignment synthesized directly from Phase 2 incident findings, equipment boundaries, and operational constraints.
      </p>

      <ul className="space-y-2 mt-2">
        {points.map((pt, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed bg-[#151a28] border border-[#20283b] p-3 rounded-lg"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <span>{pt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
