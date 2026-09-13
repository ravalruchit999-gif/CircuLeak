import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { formatCurrency, formatPayback } from '../../utils/formatters';
import { DollarSign, Clock, Award } from 'lucide-react';

export function FinancialImpact({ result }) {
  if (!result) return null;

  const investment = result.investment || 0;
  const annualSavings = result.annual_savings || 0;
  const payback = result.payback_years || 0;
  const fiveYearSavings = result.five_year_savings || annualSavings * 5;
  const netFiveYearBenefit = Math.max(fiveYearSavings - investment, 0);

  return (
    <SectionCard
      title="Financial ROI & Economic Viability"
      subtitle="Capital allocation, annual cost recovery, payback timeline, and 5-year financial impact"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs font-mono">
        <div className="p-3 rounded-lg bg-[#161a24] border border-[#232b3b] min-w-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Total Investment</span>
          <span className="text-base sm:text-lg font-bold text-white block tracking-tight whitespace-nowrap">
            {formatCurrency(investment)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">One-time capital outlay</span>
        </div>

        <div className="p-3 rounded-lg bg-[#15201c] border border-emerald-900/60 min-w-0">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1">Annual Savings</span>
          <span className="text-base sm:text-lg font-bold text-emerald-400 block tracking-tight whitespace-nowrap">
            {formatCurrency(annualSavings)}
          </span>
          <span className="text-[10px] text-emerald-400/80 block mt-0.5">Recurring OPEX cut / yr</span>
        </div>

        <div className="p-3 rounded-lg bg-[#161a24] border border-[#232b3b] min-w-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Simple Payback</span>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-base sm:text-lg font-bold text-white tracking-tight">
              {payback > 0 ? payback.toFixed(2) : (payback === 0 ? 'Immediate' : 'N/A')}
            </span>
            {payback > 0 && <span className="text-xs text-slate-400 font-sans">years</span>}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Capital breakeven</span>
        </div>

        <div className="p-3 rounded-lg bg-[#151d27] border border-blue-900/60 min-w-0">
          <span className="text-[10px] text-blue-400 uppercase tracking-wider block mb-1">5-Year Cumulative</span>
          <span className="text-base sm:text-lg font-bold text-blue-300 block tracking-tight whitespace-nowrap">
            {formatCurrency(fiveYearSavings)}
          </span>
          <span className="text-[10px] text-blue-400/80 block mt-0.5 whitespace-nowrap">
            Net: {formatCurrency(netFiveYearBenefit)}
          </span>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-[#12161f] border border-[#202737] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300 text-[11px] sm:text-xs">
            {investment > 0
              ? `Every ₹1 invested yields ₹${(fiveYearSavings / investment).toFixed(2)} in gross operational savings over 5 years.`
              : 'Zero initial capital investment required for selected zero-capex interventions.'}
          </span>
        </div>
        <span className="font-mono text-emerald-400 font-semibold text-[11px] shrink-0 hidden sm:inline">
          High Financial Yield
        </span>
      </div>
    </SectionCard>
  );
}
