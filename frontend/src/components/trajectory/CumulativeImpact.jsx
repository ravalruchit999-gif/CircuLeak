import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { formatCurrency } from '../../utils/formatters';

export function CumulativeImpact({ yearlyData = [] }) {
  return (
    <SectionCard
      title="Cumulative Financial Milestones"
      subtitle="Annual and progressive OPEX cost savings achieved through phased intervention commissioning"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#202738] text-slate-400 font-mono uppercase tracking-wider">
              <th className="pb-3 font-medium">Year</th>
              <th className="pb-3 font-medium">Milestone Implementation</th>
              <th className="pb-3 font-medium text-right">Daily Avoided</th>
              <th className="pb-3 font-medium text-right">Annual Savings</th>
              <th className="pb-3 font-medium text-right">Cumulative Savings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181e2b]">
            {yearlyData.map((row) => (
              <tr key={row.year} className="hover:bg-[#151a24]/50 transition-colors">
                <td className="py-3 font-mono font-bold text-emerald-400">{row.year}</td>
                <td className="py-3 text-slate-300">{row.milestone}</td>
                <td className="py-3 text-right font-mono text-emerald-400 font-semibold">
                  -{row.avoided_daily.toLocaleString()} kg
                </td>
                <td className="py-3 text-right font-mono text-slate-200">
                  {formatCurrency(row.annual_savings)}
                </td>
                <td className="py-3 text-right font-mono font-bold text-white">
                  {formatCurrency(row.cumulative_savings)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
