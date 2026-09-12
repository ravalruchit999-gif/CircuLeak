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
  // Ensure projection has fallback data if empty
  const chartData = projection && projection.length > 0 ? projection : [
    { year: '2026', bau_emissions: 12450, action_emissions: 10800 },
    { year: '2027', bau_emissions: 12650, action_emissions: 9300 },
    { year: '2028', bau_emissions: 12900, action_emissions: 8400 },
    { year: '2029', bau_emissions: 13150, action_emissions: 7600 },
    { year: '2030', bau_emissions: 13400, action_emissions: 6800 },
  ];

  return (
    <SectionCard
      title="5-Year Decarbonization Trajectory (2026 — 2030)"
      subtitle="Comparison between Business-As-Usual (BAU) emissions curve and CircuLeak recommended intervention pathway"
      badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
          -49.2% Net Decarbonization
        </span>
      }
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
