import React from 'react';
import { SectionCard } from '../ui/SectionCard';

export function EmissionByProcess({ processes = [] }) {
  return (
    <SectionCard
      title="Process-Level Breakdown"
      subtitle="Operational emissions distributed across primary manufacturing processes"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#202738] text-slate-400 font-mono uppercase tracking-wider">
              <th className="pb-2.5 font-medium">Process Name</th>
              <th className="pb-2.5 font-medium">Primary Energy Input</th>
              <th className="pb-2.5 font-medium text-right">Daily Emissions</th>
              <th className="pb-2.5 font-medium text-right">Share %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181e2b]">
            {processes.map((proc) => {
              const name = proc.process || proc.name;
              const share = proc.share_percent ?? proc.percentage_of_total ?? 0;
              const energy = proc.primary_energy || (name?.includes('Steam') || name?.includes('Thermal') ? 'Natural Gas' : 'Grid Electricity');
              return (
                <tr key={name} className="hover:bg-[#151a24]/50 transition-colors">
                  <td className="py-2.5 font-semibold text-slate-200">{name}</td>
                  <td className="py-2.5 text-slate-400">{energy}</td>
                  <td className="py-2.5 text-right font-mono font-medium text-slate-100">
                    {(proc.emissions_kg || 0).toLocaleString()} kgCO₂e
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-300">
                    {share}%
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
