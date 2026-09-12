import React from 'react';
import { Check, Zap } from 'lucide-react';
import { formatCurrency, formatPayback } from '../../utils/formatters';
import { SectionCard } from '../ui/SectionCard';

export function InterventionSelector({
  interventions = [],
  selectedIds = [],
  onToggle,
}) {
  return (
    <SectionCard
      title="Candidate Interventions"
      subtitle="Toggle solutions to model aggregate decarbonization and financial impact"
    >
      <div className="space-y-3">
        {interventions.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`p-3.5 rounded border transition-all cursor-pointer select-none flex items-start gap-3 ${
                isSelected
                  ? 'bg-[#151c27] border-emerald-600/70 shadow-sm'
                  : 'bg-[#13161f] border-[#222836] hover:border-slate-600 opacity-80'
              }`}
            >
              {/* Checkbox box */}
              <div
                className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-[#1a202c] border-slate-600 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs font-semibold text-slate-100 truncate">
                    {item.title}
                  </h4>
                  <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                    -{item.co2_reduction} kg/day
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400">
                  <span>Target: <strong className="text-slate-300">{item.target}</strong></span>
                  <span>Capex: <strong className="text-slate-200">{formatCurrency(item.investment)}</strong></span>
                  <span>Savings: <strong className="text-emerald-400">{formatCurrency(item.annual_savings)}/yr</strong></span>
                  <span>Payback: <strong className="text-white">{formatPayback(item.payback_years)}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
