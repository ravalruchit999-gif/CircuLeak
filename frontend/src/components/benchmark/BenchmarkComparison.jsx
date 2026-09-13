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
import { customTooltipStyle, customItemStyle, customLabelStyle } from '../../utils/chartHelpers';

export function BenchmarkComparison({ facilityIntensity = 0, benchmarkAverage = 0, bestInClass = 0, unit = 'kg/t' }) {
  const fInt = Number(facilityIntensity || 0);
  const bAvg = Number(benchmarkAverage || 0);
  const topTier = bestInClass > 0 ? bestInClass : (bAvg > 0 ? Math.round(bAvg * 0.75) : 0);
  const gap = Number((fInt - bAvg).toFixed(1));
  const maxDomain = Math.max(fInt, bAvg, topTier, 100) * 1.25;

  const data = [
    { name: 'Top Decile', intensity: topTier, color: '#10b981' },
    { name: 'Sector Benchmark', intensity: bAvg, color: '#64748b' },
    { name: 'This Facility', intensity: fInt, color: fInt > bAvg ? '#ef4444' : '#10b981' },
  ];

  return (
    <SectionCard
      title="Intensity Gap Visualizer"
      subtitle="Specific carbon intensity positioned across regional performance tiers"
    >
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
            <XAxis type="number" unit={` ${unit}`} domain={[0, Math.ceil(maxDomain)]} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={110} />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
              contentStyle={customTooltipStyle}
              itemStyle={customItemStyle}
              labelStyle={customLabelStyle}
              formatter={(val) => [`${val} ${unit}`, 'Intensity']}
            />
            {bAvg > 0 && (
              <ReferenceLine
                x={bAvg}
                stroke="#64748b"
                strokeDasharray="3 3"
                label={{ value: `Sector Avg (${bAvg})`, fill: '#94a3b8', fontSize: 10 }}
              />
            )}
            <Bar dataKey="intensity" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-[#1f2635]">
        <span>
          {gap > 0 ? `Current Gap: +${gap} ${unit} above benchmark` : `Current Status: Below sector cap`}
        </span>
        <span className="font-mono text-emerald-400">
          Best-in-Class Benchmark: {topTier} {unit}
        </span>
      </div>
    </SectionCard>
  );
}
