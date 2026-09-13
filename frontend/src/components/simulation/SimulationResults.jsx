import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { SectionCard } from '../ui/SectionCard';
import { customTooltipStyle, customItemStyle, customLabelStyle } from '../../utils/chartHelpers';
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
        <div className="p-3 rounded-lg bg-[#161a24] border border-[#232b3b] min-w-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Baseline Rate
          </span>
          <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5">
            <span className="text-base sm:text-lg font-bold text-slate-200 tracking-tight whitespace-nowrap">
              {result.baseline_emissions?.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 whitespace-nowrap">kgCO₂e/day</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Scope 1 & 2 baseline</span>
        </div>

        <div className="p-3 rounded-lg bg-[#15201d] border border-emerald-900/60 min-w-0">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1">
            Projected Rate
          </span>
          <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5">
            <span className="text-base sm:text-lg font-bold text-emerald-300 tracking-tight whitespace-nowrap">
              {result.projected_emissions?.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400/80 whitespace-nowrap">kgCO₂e/day</span>
          </div>
          <span className="text-[10px] text-emerald-400/60 block mt-0.5">Post-intervention rate</span>
        </div>

        <div className="p-3 rounded-lg bg-[#141822] border border-[#212735] min-w-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Net Reduction
          </span>
          <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5">
            <span className="text-base sm:text-lg font-bold text-emerald-400 tracking-tight whitespace-nowrap">
              -{result.reduction?.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400/80 whitespace-nowrap">kgCO₂e/day</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 block mt-0.5 whitespace-nowrap">
            (-{result.reduction_percent}% reduction)
          </span>
        </div>
      </div>

      {/* Before / After Bar Chart */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 15, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} width={55} unit=" kg" />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
              contentStyle={customTooltipStyle}
              itemStyle={customItemStyle}
              labelStyle={customLabelStyle}
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
