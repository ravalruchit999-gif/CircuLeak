import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { SectionCard } from '../ui/SectionCard';
import { customTooltipStyle } from '../../utils/chartHelpers';

export function TrajectoryChart({ projection = [] }) {
  const chartData = Array.isArray(projection) ? projection : [];

  let reductionBadge = null;
  if (chartData.length >= 2) {
    const startBAU = chartData[0].bau_emissions || chartData[0].emissions || 0;
    const endAction = chartData[chartData.length - 1].action_emissions || chartData[chartData.length - 1].emissions || 0;
    if (startBAU > 0 && endAction > 0) {
      const pct = Math.round(((startBAU - endAction) / startBAU) * 100);
      reductionBadge = (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
          -{pct}% Projected Decarbonization
        </span>
      );
    }
  }

  if (chartData.length === 0) {
    return (
      <SectionCard
        title="Decarbonization Trajectory Curve"
        subtitle="Comparison between Business-As-Usual (BAU) emissions curve and CircuLeak recommended intervention pathway"
      >
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <p className="text-sm font-medium text-slate-300">No trajectory modeling points available</p>
          <p className="text-xs text-slate-500 mt-1">Upload operational data to generate multi-year trajectory pathways.</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Decarbonization Trajectory (Multi-Year)"
      subtitle="Comparison between Business-As-Usual (BAU) emissions curve and CircuLeak recommended intervention pathway"
      badge={reductionBadge}
    >
      <div className="w-full" style={{ height: 300, minHeight: 300 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2635" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
              axisLine={{ stroke: '#222c3d' }}
              tickLine={false}
            />
            <YAxis
              domain={[5000, 15000]}
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
              axisLine={{ stroke: '#222c3d' }}
              tickLine={false}
              unit=" kg"
            />
            <Tooltip
              contentStyle={customTooltipStyle}
              formatter={(val, name) => [`${Number(val).toLocaleString()} kgCO₂e/day`, name]}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="bau_emissions"
              name="Business-As-Usual (BAU)"
              stroke="#64748b"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={{ fill: '#64748b', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="action_emissions"
              name="CircuLeak Action Pathway"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 pt-3 border-t border-[#1f2635] text-xs text-slate-400">
        <span>Target: 49.2% net daily emissions reduction by 2030</span>
        <span className="font-mono text-emerald-400 font-semibold">
          Avoided Rate: 6,600 kgCO₂e/day by Year 5
        </span>
      </div>
    </SectionCard>
  );
}
