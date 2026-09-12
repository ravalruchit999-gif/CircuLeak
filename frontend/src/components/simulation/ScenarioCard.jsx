import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { formatCurrency, formatPayback } from '../../utils/formatters';
import { Button } from '../ui/Button';

export function ScenarioCard({ scenario, isActive, onSelect }) {
  if (!scenario) return null;

  return (
    <div
      className={`p-4 rounded border transition-all flex flex-col justify-between ${
        isActive
          ? 'bg-[#151d29] border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
          : 'bg-[#131620] border-[#222938] hover:border-slate-600'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            {scenario.tag}
          </span>
          {isActive && (
            <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Active Strategy
            </span>
          )}
        </div>

        <h4 className="text-sm font-semibold text-white mb-0.5">{scenario.name}</h4>
        <p className="text-xs text-slate-400 mb-3">{scenario.subtitle}</p>

        <div className="space-y-2 py-2.5 border-y border-[#1f2636] text-xs font-mono mb-3">
          <div className="flex justify-between">
            <span className="text-slate-400">CO₂ Reduction:</span>
            <span className="font-semibold text-emerald-400">
              -{scenario.reduction} kg ({scenario.reduction_percent}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Required Capex:</span>
            <span className="text-slate-200 font-semibold">
              {formatCurrency(scenario.investment)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Annual Savings:</span>
            <span className="text-emerald-400 font-semibold">
              {formatCurrency(scenario.annual_savings)}/yr
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Simple Payback:</span>
            <span className="text-white font-semibold">
              {formatPayback(scenario.payback_years)}
            </span>
          </div>
        </div>
      </div>

      <Button
        variant={isActive ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => onSelect(scenario)}
        className="w-full"
      >
        {isActive ? 'Current Strategy' : 'Apply Scenario'}
      </Button>
    </div>
  );
}
