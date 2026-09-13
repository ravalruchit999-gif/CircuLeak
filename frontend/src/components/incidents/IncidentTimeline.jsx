import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Activity, Clock } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';
import { customTooltipStyle, customItemStyle, customLabelStyle } from '../../utils/chartHelpers';

export function IncidentTimeline({ timeline = [], baselineValue = null }) {
  if (!timeline || timeline.length === 0) {
    return (
      <SectionCard
        title="INCIDENT TIMELINE"
        subtitle="Chronological progression of telemetry during the detected anomaly window"
        className="mb-6"
      >
        <div className="py-12 px-4 text-center bg-[#121622] rounded-lg border border-[#1e2536]">
          <Activity className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-400">
            Insufficient interval telemetry points available to construct a granular time-series curve.
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            Aggregated values are reflected in the impact and metric summary cards above.
          </p>
        </div>
      </SectionCard>
    );
  }

  // Format data points for Recharts
  const chartData = timeline.map((pt) => {
    let label = pt.timestamp;
    try {
      const dt = new Date(pt.timestamp);
      if (!isNaN(dt.getTime())) {
        label = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    } catch {
      label = pt.timestamp;
    }

    return {
      time: label,
      rawTimestamp: pt.timestamp,
      observed: pt.observed,
      baseline: pt.baseline,
      is_anomaly: pt.is_anomaly,
      anomalyHighlight: pt.is_anomaly ? pt.observed : null,
    };
  });

  return (
    <SectionCard
      title="INCIDENT TIMELINE"
      subtitle="Observed consumption curve vs expected operating baseline (Highlighted regions indicate flagged anomalies)"
      className="mb-6"
      badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {timeline.length} Observations
        </span>
      }
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="incidentObservedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1c2333" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={{ stroke: '#2d3748' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={{ stroke: '#2d3748' }}
              unit=" kWh"
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={customTooltipStyle}
              itemStyle={customItemStyle}
              labelStyle={customLabelStyle}
              formatter={(val, name) => [
                typeof val === 'number' ? `${val.toFixed(1)} kWh` : val,
                name === 'observed'
                  ? 'Observed Telemetry'
                  : name === 'baseline'
                  ? 'Expected Baseline'
                  : name,
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />

            {baselineValue !== null && typeof baselineValue === 'number' && (
              <ReferenceLine
                y={baselineValue}
                stroke="#3b82f6"
                strokeDasharray="4 4"
                label={{
                  value: `Baseline (${baselineValue.toFixed(1)} kWh)`,
                  fill: '#60a5fa',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="observed"
              name="Observed Telemetry"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#incidentObservedGrad)"
            />

            <Line
              type="monotone"
              dataKey="baseline"
              name="Expected Baseline"
              stroke="#3b82f6"
              strokeWidth={1.75}
              strokeDasharray="5 5"
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="anomalyHighlight"
              name="Anomaly Point"
              stroke="transparent"
              dot={{ stroke: '#ef4444', strokeWidth: 2, fill: '#fee2e2', r: 4 }}
              activeDot={{ r: 6, fill: '#ef4444' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-[#1c2333]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Observed Operational Telemetry</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-500 border-dashed" />
            <span>Expected Baseline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-red-500 bg-red-200" />
            <span>Flagged Anomaly Region</span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
