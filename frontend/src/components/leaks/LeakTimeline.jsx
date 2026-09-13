import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { SectionCard } from '../ui/SectionCard';
import { customTooltipStyle, customItemStyle, customLabelStyle } from '../../utils/chartHelpers';

export function LeakTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <SectionCard
      title="24-Hour Observed Operating Profile vs Baseline"
      subtitle="Observed consumption curve across operational shifts (Notice abnormal divergence during night shift 22:00-04:00)"
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorObserved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2635" />
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} unit=" kWh" domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={customTooltipStyle}
              itemStyle={customItemStyle}
              labelStyle={customLabelStyle}
              formatter={(val, name) => [`${val} kWh`, name]}
            />
            <ReferenceLine
              y={42}
              stroke="#64748b"
              strokeDasharray="4 4"
              label={{ value: 'Idle Baseline (42 kWh)', fill: '#94a3b8', fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="observed"
              name="Observed Operating Consumption"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorObserved)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="baseline"
              name="Expected Baseline Consumption"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorBaseline)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-[#1f2635]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-500" />
            <span>Observed Operating (61 kWh off-hours)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500" />
            <span>Expected Baseline (42 kWh idle)</span>
          </div>
        </div>
        <span className="font-mono text-red-400">+19 kWh/hr Unloader Bleed</span>
      </div>
    </SectionCard>
  );
}
