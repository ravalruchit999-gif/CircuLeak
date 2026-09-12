import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { SectionCard } from '../ui/SectionCard';
import { Activity, AlertTriangle, Clock, Zap, Info } from 'lucide-react';
import { Button } from '../ui/Button';

// 24-Hour Diurnal telemetry profile for Apex Metals & Casting Unit 4
// Baseline expected load vs Actual measured emissions
// Shows the distinct unloader valve leak during off-hours (22:00 - 06:00)
const hourlyData = [
  { hour: '00:00', baseline: 310, actual: 430, shift: 'Night', leak: 120 },
  { hour: '01:00', baseline: 310, actual: 428, shift: 'Night', leak: 118 },
  { hour: '02:00', baseline: 305, actual: 425, shift: 'Night', leak: 120 },
  { hour: '03:00', baseline: 305, actual: 429, shift: 'Night', leak: 124 },
  { hour: '04:00', baseline: 315, actual: 435, shift: 'Night', leak: 120 },
  { hour: '05:00', baseline: 330, actual: 445, shift: 'Night', leak: 115 },
  { hour: '06:00', baseline: 480, actual: 495, shift: 'Morning', leak: 15 },
  { hour: '07:00', baseline: 540, actual: 550, shift: 'Morning', leak: 10 },
  { hour: '08:00', baseline: 580, actual: 590, shift: 'Morning', leak: 10 },
  { hour: '09:00', baseline: 590, actual: 605, shift: 'Morning', leak: 15 },
  { hour: '10:00', baseline: 610, actual: 620, shift: 'Morning', leak: 10 },
  { hour: '11:00', baseline: 600, actual: 615, shift: 'Morning', leak: 15 },
  { hour: '12:00', baseline: 570, actual: 582, shift: 'Morning', leak: 12 },
  { hour: '13:00', baseline: 585, actual: 598, shift: 'Morning', leak: 13 },
  { hour: '14:00', baseline: 560, actual: 575, shift: 'Evening', leak: 15 },
  { hour: '15:00', baseline: 570, actual: 584, shift: 'Evening', leak: 14 },
  { hour: '16:00', baseline: 580, actual: 595, shift: 'Evening', leak: 15 },
  { hour: '17:00', baseline: 590, actual: 610, shift: 'Evening', leak: 20 },
  { hour: '18:00', baseline: 585, actual: 602, shift: 'Evening', leak: 17 },
  { hour: '19:00', baseline: 560, actual: 578, shift: 'Evening', leak: 18 },
  { hour: '20:00', baseline: 520, actual: 538, shift: 'Evening', leak: 18 },
  { hour: '21:00', baseline: 460, actual: 480, shift: 'Evening', leak: 20 },
  { hour: '22:00', baseline: 320, actual: 440, shift: 'Night', leak: 120 },
  { hour: '23:00', baseline: 315, actual: 432, shift: 'Night', leak: 117 },
];

export function ShiftTelemetryChart() {
  const [activeShiftFilter, setActiveShiftFilter] = useState('all');

  const filteredData =
    activeShiftFilter === 'all'
      ? hourlyData
      : hourlyData.filter((d) => d.shift.toLowerCase() === activeShiftFilter);

  return (
    <SectionCard
      title="24-Hour Shift Telemetry & Carbon Bleed Profile"
      subtitle="Real-time diurnal emissions tracking: Expected plant baseline vs actual telemetry, pinpointing off-hours leak anomalies"
      badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-semibold flex items-center gap-1 animate-pulse">
          <AlertTriangle className="w-3 h-3" /> Night Shift Anomaly Active
        </span>
      }
      action={
        <div className="flex items-center gap-1.5 bg-[#121620] p-1 rounded-lg border border-[#202737]">
          <button
            onClick={() => setActiveShiftFilter('all')}
            className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
              activeShiftFilter === 'all'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            24h Diurnal
          </button>
          <button
            onClick={() => setActiveShiftFilter('night')}
            className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
              activeShiftFilter === 'night'
                ? 'bg-red-900/80 text-red-200 font-semibold border border-red-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Night Leak Zone (22:00-06:00)
          </button>
          <button
            onClick={() => setActiveShiftFilter('morning')}
            className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
              activeShiftFilter === 'morning'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Day Shift
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Real-time telemetry metric badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-[#12161f] border border-[#1e2535] text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Current Shift</span>
            <span className="text-white font-bold text-sm block">Night (22:00 — 06:00)</span>
            <span className="text-[10px] text-slate-500">Scheduled idle/cooling</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Expected Baseline</span>
            <span className="text-slate-300 font-bold text-sm block">310 kgCO₂e/hr</span>
            <span className="text-[10px] text-slate-500">Nominal idle holding</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Measured Emissions</span>
            <span className="text-red-400 font-bold text-sm block">430 kgCO₂e/hr</span>
            <span className="text-[10px] text-red-400 font-semibold">+38.7% Over Baseline</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Avoidable Bleed Rate</span>
            <span className="text-amber-400 font-bold text-sm block">~120 kgCO₂e/hr</span>
            <span className="text-[10px] text-amber-400 font-medium">Compressor 03 unloader</span>
          </div>
        </div>

        {/* 24-Hour Area Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1d2433" vertical={false} />

              <XAxis
                dataKey="hour"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#222c3d' }}
                tickLine={false}
              />

              <YAxis
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#222c3d' }}
                tickLine={false}
                unit=" kg"
                domain={[200, 700]}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="bg-[#121620] border border-[#2c374d] p-3 rounded-lg shadow-xl text-xs font-mono space-y-1">
                        <div className="flex items-center justify-between gap-3 text-slate-300 border-b border-[#232c3d] pb-1 font-bold">
                          <span>{label} ({dataPoint.shift} Shift)</span>
                          {dataPoint.leak > 30 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                              Leak Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-400">
                          <span>Expected Baseline:</span>
                          <strong>{dataPoint.baseline} kgCO₂e/hr</strong>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-red-400">
                          <span>Actual Measured:</span>
                          <strong>{dataPoint.actual} kgCO₂e/hr</strong>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-amber-300 pt-1 border-t border-[#1e2736]">
                          <span>Avoidable Bleed:</span>
                          <strong>+{dataPoint.leak} kgCO₂e/hr</strong>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Night leak highlight bands (00:00 to 06:00 and 22:00 to 23:00) */}
              {activeShiftFilter === 'all' && (
                <>
                  <ReferenceArea
                    x1="00:00"
                    x2="05:00"
                    fill="#ef4444"
                    fillOpacity={0.08}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    strokeOpacity={0.3}
                  />
                  <ReferenceArea
                    x1="22:00"
                    x2="23:00"
                    fill="#ef4444"
                    fillOpacity={0.08}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    strokeOpacity={0.3}
                  />
                </>
              )}

              <Area
                type="monotone"
                dataKey="actual"
                name="Actual Telemetry"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#actualGradient)"
              />

              <Area
                type="monotone"
                dataKey="baseline"
                name="Expected Baseline"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#baselineGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Shift Context Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1e2637] text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-0.5 bg-red-500 inline-block" />
              <span>Actual Measured Telemetry</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500 inline-block" />
              <span>Standard Operational Baseline</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Shaded red region indicates Compressor 03 unloader leak (+45% idle draw) during non-production hours.
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
