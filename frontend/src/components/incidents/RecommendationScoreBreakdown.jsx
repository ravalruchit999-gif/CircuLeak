import React from 'react';
import { Award, CheckCircle, Shield, TrendingUp, BookOpen, Wrench } from 'lucide-react';

export function RecommendationScoreBreakdown({ scoreBreakdown }) {
  if (!scoreBreakdown) return null;

  const items = [
    {
      label: 'Problem Fit',
      score: scoreBreakdown.problem_fit_score,
      max: 24,
      detail: scoreBreakdown.problem_fit_detail,
      icon: CheckCircle,
      barColor: 'bg-emerald-500',
    },
    {
      label: 'Objective Alignment',
      score: scoreBreakdown.objective_alignment_score,
      max: 20,
      detail: scoreBreakdown.objective_alignment_detail,
      icon: Award,
      barColor: 'bg-blue-500',
    },
    {
      label: 'Economic Attractiveness',
      score: scoreBreakdown.economic_attractiveness_score,
      max: 15,
      detail: scoreBreakdown.economic_attractiveness_detail,
      icon: TrendingUp,
      barColor: 'bg-amber-500',
    },
    {
      label: 'Evidence & Provenance',
      score: scoreBreakdown.evidence_support_score,
      max: 12,
      detail: scoreBreakdown.evidence_support_detail,
      icon: BookOpen,
      barColor: 'bg-purple-500',
    },
    {
      label: 'Implementation Fit',
      score: scoreBreakdown.implementation_fit_score,
      max: 8,
      detail: scoreBreakdown.implementation_fit_detail,
      icon: Wrench,
      barColor: 'bg-teal-500',
    },
    {
      label: 'Safety & Risk Guardrails',
      score: scoreBreakdown.safety_score,
      max: 3,
      detail: scoreBreakdown.safety_detail,
      icon: Shield,
      barColor: 'bg-rose-500',
    },
  ];

  return (
    <div className="bg-[#0e121c] rounded-xl border border-[#1e2536] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">
            Explainable 100-Point Score Decomposition
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent additive formula with zero black-box weights. Total score determines intervention ranking.
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-emerald-400">
            {scoreBreakdown.total_score}
          </span>
          <span className="text-xs text-slate-500 block">/ 100 max</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const pct = Math.min(100, Math.round((item.score / item.max) * 100));

          return (
            <div
              key={idx}
              className="p-3 rounded-lg bg-[#141926] border border-[#20283b] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-semibold text-slate-200">
                    {item.score} <span className="text-slate-500 font-normal">/{item.max}</span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#1b2234] rounded-full h-1.5 mb-2 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${item.barColor} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                {item.detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
