import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { CheckCircle2 } from 'lucide-react';

export function InterventionTimeline({ phases = [] }) {
  return (
    <SectionCard
      title="Phased Implementation Roadmap"
      subtitle="Execution sequence structured by operational complexity, capital allocation, and ROI payback"
    >
      <div className="space-y-4">
        {phases.map((phase, idx) => {
          const phaseName = phase.name || phase.phase || `Phase ${idx + 1}`;
          const capex = phase.total_investment ?? phase.total_capex ?? 0;
          const savings = phase.total_annual_savings ?? 0;
          const co2 = phase.total_co2_reduction ?? 0;
          const interventions = Array.isArray(phase.interventions) ? phase.interventions : [];

          return (
            <div
              key={phase.phase_number || phase.phase || idx}
              className="p-4 rounded-xl bg-[#141822] border border-[#212837] relative"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[#1c2331]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                      {phaseName}
                    </h4>
                    {phase.timeline && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {phase.timeline}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">
                    Capex: <strong className="text-slate-200">{formatCurrency(capex)}</strong>
                  </span>
                  <span className="text-slate-400">
                    Savings: <strong className="text-emerald-400">{formatCurrency(savings)}/yr</strong>
                  </span>
                  {co2 > 0 && (
                    <span className="text-slate-400">
                      Offset: <strong className="text-cyan-400">{formatNumber(co2)} kgCO₂e/yr</strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {interventions.map((item, i) => {
                  const title = typeof item === 'string' ? item : (item.title || item.name || item.recommendation || 'Circular Intervention');
                  const equipment = typeof item === 'object' ? item.target_equipment : null;
                  const payback = typeof item === 'object' ? item.payback_years : null;
                  const itemCapex = typeof item === 'object' ? item.investment : null;

                  return (
                    <div
                      key={item.id || i}
                      className="p-2.5 rounded bg-[#10141d] border border-[#1d2433] flex items-start justify-between gap-2"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-xs text-slate-200 font-medium block truncate">
                            {title}
                          </span>
                          {equipment && (
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Asset: {equipment}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 font-mono text-[11px]">
                        {payback !== null && payback !== undefined && (
                          <span className="text-emerald-400 block font-semibold">
                            {payback} yr payback
                          </span>
                        )}
                        {itemCapex !== null && itemCapex !== undefined && (
                          <span className="text-slate-400 text-[10px] block">
                            {formatCurrency(itemCapex)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
