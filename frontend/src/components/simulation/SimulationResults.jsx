import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { SectionCard } from '../ui/SectionCard';
import { customTooltipStyle } from '../../utils/chartHelpers';
import { ArrowDownRight, CheckCircle2 } from 'lucide-react';

export function SimulationResults({ result }) {
  if (!result) return null;

  const chartData = [
    { name: 'Baseline Emissions', emissions: result.baseline_emissions, color: '#64748b' },
    { name: 'Projected Emissions', emissions: result.projected_emissions, color: '#10b981' },
  ];

  return (
    <SectionCard
      title="Carbon Impact Modeling"
      subtitle="Before vs After daily emissions comparison based on active selections"
      badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
          -{result.reduction_percent}% Abatement
        </span>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs font-mono">
        <div className="p-3 rounded bg-[#161a24] border border-[#232b3b]">
          <span className="text-[10px] text-slate-400 uppercase block">Baseline Rate</span>
          <span className="text-lg font-bold text-slate-200">
            {result.baseline_emissions?.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 ml-1">kgCO₂e/day</span>
        </div>

        <div className="p-3 rounded bg-[#15201d] border border-emerald-900/60">
          <span className="text-[10px] text-emerald-400 uppercase block">Projected Rate</span>
          <span className="text-lg font-bold text-emerald-300">
            {result.projected_emissions?.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-400/80 ml-1">kgCO₂e/day</span>
        </div>

        <div className="p-3 rounded bg-[#141822] border border-[#212735]">
          <span className="text-[10px] text-slate-400 uppercase block">Net Reduction</span>
          <span className="text-lg font-bold text-emerald-400">
            -{result.reduction?.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 ml-1">kg (-{result.reduction_percent}%)</span>
        </div>
      </div>

      {/* Before / After Bar Chart */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} unit=" kg" />
            <Tooltip
              contentStyle={customTooltipStyle}
              formatter={(val) => [`${val.toLocaleString()} kgCO₂e/day`, 'Emissions']}
            />
            <Bar dataKey="emissions" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
