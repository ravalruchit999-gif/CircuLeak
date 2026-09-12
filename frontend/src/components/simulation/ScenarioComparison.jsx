import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { formatCurrency, formatPayback } from '../../utils/formatters';
import { Button } from '../ui/Button';

export function ScenarioComparison({ scenarios = [], activeId, onSelect }) {
  return (
    <SectionCard
      title="Strategic Scenario Comparison"
      subtitle="Evaluate tradeoffs across capital allocation, carbon abatement velocity, and operational savings"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#202738] text-slate-400 font-mono uppercase tracking-wider">
              <th className="pb-3 font-medium">Strategy</th>
              <th className="pb-3 font-medium text-right">Daily CO₂ Cut</th>
              <th className="pb-3 font-medium text-right">Reduction %</th>
              <th className="pb-3 font-medium text-right">Total Investment</th>
              <th className="pb-3 font-medium text-right">Annual Savings</th>
              <th className="pb-3 font-medium text-right">Payback Period</th>
              <th className="pb-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181e2b]">
            {scenarios.map((scen) => {
              const isActive = activeId === scen.id;
              return (
                <tr
                  key={scen.id}
                  className={`transition-colors ${
                    isActive ? 'bg-[#151d29]/80 font-medium' : 'hover:bg-[#151a24]/50'
                  }`}
                >
                  <td className="py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-100">{scen.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{scen.tag}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono text-emerald-400 font-semibold">
                    -{scen.reduction.toLocaleString()} kg
                  </td>
                  <td className="py-3 text-right font-mono text-emerald-400">
                    {scen.reduction_percent}%
                  </td>
                  <td className="py-3 text-right font-mono text-slate-200">
                    {formatCurrency(scen.investment)}
                  </td>
                  <td className="py-3 text-right font-mono text-emerald-400">
                    {formatCurrency(scen.annual_savings)}
                  </td>
                  <td className="py-3 text-right font-mono text-white">
                    {formatPayback(scen.payback_years)}
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant={isActive ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => onSelect(scen)}
                    >
                      {isActive ? 'Active' : 'Select'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
