import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { SectionCard } from '../ui/SectionCard';
import { customTooltipStyle } from '../../utils/chartHelpers';

export function BenchmarkComparison({ facilityIntensity = 101, benchmarkAverage = 85 }) {
  const data = [
    { name: 'Top Decile', intensity: 68, color: '#10b981' },
    { name: 'Sector Benchmark', intensity: benchmarkAverage, color: '#64748b' },
    { name: 'This Facility', intensity: facilityIntensity, color: '#ef4444' },
  ];

  return (
    <SectionCard
      title="Intensity Gap Visualizer"
      subtitle="Specific carbon intensity (kgCO₂e / metric ton product) positioned across performance tiers"
    >
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
            <XAxis type="number" unit=" kg/t" domain={[0, 130]} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={110} />
            <Tooltip
              contentStyle={customTooltipStyle}
              formatter={(val) => [`${val} kgCO₂e / metric ton product`, 'Intensity']}
            />
            <ReferenceLine
              x={benchmarkAverage}
              stroke="#64748b"
              strokeDasharray="3 3"
              label={{ value: 'Average (85)', fill: '#94a3b8', fontSize: 10 }}
            />
            <Bar dataKey="intensity" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-[#1f2635]">
        <span>Current Gap: +16 kgCO₂e/tonne</span>
        <span className="font-mono text-emerald-400">
          Projected with CircuLeak Interventions: 75.4 kg/t
        </span>
      </div>
    </SectionCard>
  );
}
