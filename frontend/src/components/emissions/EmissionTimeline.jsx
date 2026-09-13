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
import { customTooltipStyle, customItemStyle, customLabelStyle } from '../../utils/chartHelpers';

export function EmissionTimeline({ timeline = [] }) {
  const hasData = Array.isArray(timeline) && timeline.length > 0;
  const avgBaseline = hasData
    ? Math.round(timeline.reduce((acc, p) => acc + (p.baseline || p.emissions * 0.85), 0) / timeline.length)
    : 12000;

  return (
    <SectionCard
      title="Temporal Emission Trend"
      subtitle={
        hasData
          ? `Continuous operational profile across ${timeline.length} recorded intervals against target baseline`
          : '30-day continuous profile compared against operational target baseline'
      }
    >
      <div className="h-64 w-full">
        {!hasData ? (
          <div className="h-full w-full flex flex-col items-center justify-center border border-dashed border-[#232b3b] rounded-lg text-slate-500 text-xs">
            <p>No operational time-series telemetry recorded for this facility.</p>
            <p className="text-[11px] text-slate-600 mt-1">Upload daily logs to generate continuous temporal trends.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 10, right: 30, left: 15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2635" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#64748b', fontSize: 11 }}
                unit=" kg"
              />
              <Tooltip
                contentStyle={customTooltipStyle}
                itemStyle={customItemStyle}
                labelStyle={customLabelStyle}
                formatter={(val, name) => [
                  `${Number(val).toLocaleString(undefined, { maximumFractionDigits: 1 })} kgCO₂e`,
                  name || 'Emissions',
                ]}
              />
              <ReferenceLine
                y={avgBaseline}
                stroke="#64748b"
                strokeDasharray="4 4"
                label={{ value: 'Target Baseline', fill: '#94a3b8', fontSize: 11, position: 'top' }}
              />
              <Line
                type="monotone"
                dataKey="emissions"
                name="Observed Emissions"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </SectionCard>
  );
}
