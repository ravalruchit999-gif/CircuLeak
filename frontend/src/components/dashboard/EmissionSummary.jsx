import React from 'react';
import { Activity, AlertTriangle, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatPayback } from '../../utils/formatters';

export function EmissionSummary({ metrics }) {
  if (!metrics) return null;

  const totalEmissions = metrics.total_emissions || 0;
  const highRiskCount = metrics.high_risk_count || 0;
  const leakCount = metrics.leak_count || 0;
  const potentialReduction = metrics.potential_reduction || 0;
  const reductionPercent = metrics.potential_reduction_percent || 0;
  const annualSavings = metrics.annual_savings || 0;
  const capex = metrics.investment_required || 0;
  const payback = metrics.payback_years || 0;
  const intensity = metrics.emissions_intensity || 0;
  const peakAnomaly = metrics.peak_anomaly_equipment || (highRiskCount > 0 ? 'High Loss Hotspot' : 'Nominal Operations');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Daily Emissions */}
      <div className="relative p-5 rounded-lg bg-[#121620] border border-[#202738] hover:border-slate-600 transition-all group overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Daily Plant Footprint
          </span>
          <div className="p-1.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/60">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl lg:text-3xl font-bold font-mono text-white tracking-tight">
            {totalEmissions.toLocaleString()}
          </span>
          <span className="text-xs font-mono text-slate-400">kgCO₂e / day</span>
        </div>

        <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#1b2230]">
          <span className="text-slate-400">Annual: {metrics.total_emissions_annual ? metrics.total_emissions_annual.toLocaleString() : (Math.round(totalEmissions * 365 / 1000)).toLocaleString()} tCO₂e</span>
          <span className="font-mono text-[11px] text-amber-400 font-medium">
            {intensity > 0 ? `${intensity} kgCO₂e/unit` : 'Operational'}
          </span>
        </div>
      </div>

      {/* 2. Flagged Carbon Leaks */}
      <div className="relative p-5 rounded-lg bg-[#141620] border border-red-950/80 hover:border-red-700/80 transition-all group overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-600" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Flagged Carbon Leaks
          </span>
          <div className="p-1.5 rounded bg-red-950/80 text-red-400 border border-red-800/80 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl lg:text-3xl font-bold font-mono text-red-400 tracking-tight">
            {highRiskCount}
          </span>
          <span className="text-xs font-mono text-slate-400">Critical / {leakCount} Total</span>
        </div>

        <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#1e2332]">
          <span className="text-slate-400 truncate max-w-[150px]">Peak Anomaly: {peakAnomaly}</span>
          <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded border font-bold ${
            highRiskCount > 0 ? 'bg-red-950 text-red-300 border-red-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
          }`}>
            {highRiskCount > 0 ? 'Action Required' : 'Optimal'}
          </span>
        </div>
      </div>

      {/* 3. Potential CO2 Abatement */}
      <div className="relative p-5 rounded-lg bg-[#121820] border border-emerald-950/80 hover:border-emerald-700/80 transition-all group overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Achievable Abatement
          </span>
          <div className="p-1.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl lg:text-3xl font-bold font-mono text-emerald-400 tracking-tight">
            -{potentialReduction.toLocaleString()}
          </span>
          <span className="text-xs font-mono text-slate-400">kgCO₂e / day</span>
        </div>

        <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#1b252c]">
          <span className="text-slate-400">Net Plant Cut</span>
          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
            -{reductionPercent}% CO₂
          </span>
        </div>
      </div>

      {/* 4. Estimated Annual Savings */}
      <div className="relative p-5 rounded-lg bg-[#121722] border border-[#202738] hover:border-slate-600 transition-all group overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Annual Cost Recovery
          </span>
          <div className="p-1.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl lg:text-3xl font-bold font-mono text-white tracking-tight">
            {formatCurrency(annualSavings, true)}
          </span>
          <span className="text-xs font-mono text-slate-400">/ year recurring</span>
        </div>

        <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#1b2230]">
          <span className="text-slate-400">Capex: {formatCurrency(capex, true)}</span>
          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#1c2432] text-slate-200 border border-slate-700 font-semibold">
            {formatPayback(payback)} Payback
          </span>
        </div>
      </div>
    </div>
  );
}
