import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { formatCurrency, formatPayback } from '../../utils/formatters';

export function AuditRecommendations({ packageDetails }) {
  if (!packageDetails) return null;

  return (
    <SectionCard
      title="Consolidated Action Plan & Financial Return"
      subtitle="Aggregated capital budget, projected return on investment, and emission reduction commitments"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded bg-[#161a24] border border-[#263042] text-xs font-mono mb-4">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Total Capital Outlay</span>
          <span className="text-base font-bold text-white">
            {formatCurrency(packageDetails.total_capex)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Annual OPEX Cut</span>
          <span className="text-base font-bold text-emerald-400">
            {formatCurrency(packageDetails.annual_savings)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Payback Period</span>
          <span className="text-base font-bold text-white">
            {formatPayback(packageDetails.payback_years)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Daily CO₂ Cut</span>
          <span className="text-base font-bold text-emerald-400">
            -{packageDetails.co2_reduction_daily?.toLocaleString()} kgCO₂e/day ({packageDetails.reduction_percent}%)
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
