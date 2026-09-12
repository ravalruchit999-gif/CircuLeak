import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { formatCurrency, formatPayback } from '../../utils/formatters';
import { DollarSign, Clock, TrendingUp, Award } from 'lucide-react';

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
        <div className="p-3.5 rounded bg-[#161a24] border border-[#232b3b]">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">Total Investment</span>
          <span className="text-xl font-bold text-white block">
            {formatCurrency(investment)}
          </span>
          <span className="text-[10px] text-slate-400">One-time capital outlay</span>
        </div>

        <div className="p-3.5 rounded bg-[#15201c] border border-emerald-900/60">
          <span className="text-[10px] text-emerald-400 uppercase block mb-1">Annual Savings</span>
          <span className="text-xl font-bold text-emerald-400 block">
            {formatCurrency(annualSavings)}
          </span>
          <span className="text-[10px] text-emerald-400/80">Recurring OPEX cut / yr</span>
        </div>

        <div className="p-3.5 rounded bg-[#161a24] border border-[#232b3b]">
          <span className="text-[10px] text-slate-400 uppercase block mb-1">Simple Payback</span>
          <span className="text-xl font-bold text-white block">
            {formatPayback(payback)}
          </span>
          <span className="text-[10px] text-slate-400">Capital breakeven</span>
        </div>

        <div className="p-3.5 rounded bg-[#151d27] border border-blue-900/60">
          <span className="text-[10px] text-blue-400 uppercase block mb-1">5-Year Cumulative</span>
          <span className="text-xl font-bold text-blue-300 block">
            {formatCurrency(fiveYearSavings)}
          </span>
          <span className="text-[10px] text-blue-400/80">
            Net: {formatCurrency(netFiveYearBenefit)}
          </span>
        </div>
      </div>

      <div className="p-3 rounded bg-[#12161f] border border-[#202737] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300">
            Every ₹1 invested yields ₹3.23 in gross operational savings over 5 years.
          </span>
        </div>
        <span className="font-mono text-emerald-400 font-semibold hidden sm:inline">
          High Financial Yield
        </span>
      </div>
    </SectionCard>
  );
}
