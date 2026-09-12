import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { SectionCard } from '../ui/SectionCard';
import { customTooltipStyle } from '../../utils/chartHelpers';

export function EmissionTimeline({ timeline = [] }) {
  return (
    <SectionCard
      title="Temporal Emission Trend"
      subtitle="30-day continuous profile compared against the 12,000 kgCO₂e baseline"
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeline} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2635" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis
              domain={[10000, 15000]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              unit=" kg"
            />
            <Tooltip contentStyle={customTooltipStyle} />
            <ReferenceLine
              y={12000}
              stroke="#64748b"
              strokeDasharray="4 4"
              label={{ value: 'Target Baseline', fill: '#94a3b8', fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="emissions"
              name="Observed Emissions"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
