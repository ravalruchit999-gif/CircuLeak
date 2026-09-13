import React from 'react';
import { X, Check, ArrowRight, ShieldCheck, Scale } from 'lucide-react';

export function RecommendationComparisonModal({
  isOpen,
  onClose,
  items = [],
  tradeoffs = [],
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#121622] rounded-2xl border border-[#273248] max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1e2536] flex items-center justify-between bg-[#151a28]">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Intervention Side-by-Side Tradeoff Comparison
              </h3>
              <p className="text-xs text-slate-400">
                Multi-attribute comparative evaluation against equipment boundaries, capital requirements, and payback.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Comparison Cards Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-${Math.min(items.length, 3)} gap-4`}>
            {items.map((card) => {
              const { economics, score_breakdown } = card;

              return (
                <div
                  key={card.id}
                  className="bg-[#0e121c] rounded-xl border border-[#1e2536] p-4 flex flex-col justify-between space-y-4 shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {card.target_equipment}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Score: {score_breakdown?.total_score != null ? score_breakdown.total_score : 'N/A'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 mb-1 leading-snug">
                      {card.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                      {card.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-[#1a2233] text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Estimated Capex:</span>
                        <span className="font-semibold text-slate-200">
                          {economics?.capex_inr != null ? `₹${economics.capex_inr.toLocaleString('en-IN')}` : 'N/A'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Net Annual Savings:</span>
                        <span className="font-semibold text-emerald-400">
                          {economics?.annual_savings_inr != null ? `₹${Math.round(economics.annual_savings_inr).toLocaleString('en-IN')}/yr` : 'Pending'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Payback Period:</span>
                        <span className="font-semibold text-amber-300">
                          {economics?.payback_period_years != null ? `${economics.payback_period_years} Yrs` : 'N/A'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Annual CO2 Abatement:</span>
                        <span className="font-semibold text-teal-300">
                          {economics?.annual_co2_reduction_kg != null ? `${Math.round(economics.annual_co2_reduction_kg).toLocaleString('en-IN')} kg` : 'N/A'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Operational Disruption:</span>
                        <span className="font-medium text-slate-300">{card.operational_disruption}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Implementation Complexity:</span>
                        <span className="font-medium text-slate-300">{card.implementation_complexity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1a2233] text-[10px] text-slate-500">
                    Ref: {card.reference?.reference_organization || 'BEE'} ({card.reference?.reference_year || 2022})
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tradeoff Summary Table */}
          {tradeoffs && tradeoffs.length > 0 && (
            <div className="p-4 rounded-xl bg-[#0e121c] border border-[#1e2536] space-y-2">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Engineering Tradeoff Matrix
              </h4>
              <div className="space-y-1.5">
                {tradeoffs.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-[#141926] border border-[#1e2536] text-xs text-slate-300 flex items-start gap-2"
                  >
                    <span className="font-semibold text-emerald-400 shrink-0">{t.title}:</span>
                    <span className="text-slate-400">{t.key_tradeoff}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1e2536] bg-[#151a28] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
