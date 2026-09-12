import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { SectionCard } from '../ui/SectionCard';
import { Activity, AlertTriangle, Info } from 'lucide-react';
import { useFacilityContext } from '../../context/FacilityContext';
import { getEmissionsTimeline } from '../../services/emissionsApi';
import { getLeakAnomalies } from '../../services/leaksApi';

export function ShiftTelemetryChart() {
  const { currentFacilityId } = useFacilityContext();
  const [timelineData, setTimelineData] = useState([]);
  const [topLeak, setTopLeak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeShiftFilter, setActiveShiftFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const fetchTimeline = async () => {
      if (!currentFacilityId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [timeRes, anomRes] = await Promise.allSettled([
          getEmissionsTimeline(currentFacilityId),
          getLeakAnomalies(currentFacilityId),
        ]);

        const rawTimeline = timeRes.status === 'fulfilled' ? (timeRes.value?.data || []) : [];
        const rawAnoms = anomRes.status === 'fulfilled' ? (anomRes.value?.data?.anomalies || anomRes.value?.data?.leaks || []) : [];

        if (isMounted) {
          if (Array.isArray(rawTimeline) && rawTimeline.length > 0) {
            const formatted = rawTimeline.map((pt) => {
              const hourNum = typeof pt.hour === 'number' ? pt.hour : parseInt(pt.hour || '0', 10);
              const hourLabel = `${String(hourNum).padStart(2, '0')}:00`;
              const shift = hourNum >= 22 || hourNum < 6 ? 'Night' : hourNum < 14 ? 'Morning' : 'Evening';
              const actual = Math.round(pt.actual ?? pt.emissions ?? pt.electricity_kwh ?? 0);
              const baseline = Math.round(pt.baseline ?? (actual * 0.85));
              const leak = Math.max(0, actual - baseline);

              return {
                hour: hourLabel,
                hourNum,
                shift,
                actual,
                baseline,
                leak,
              };
            });
            setTimelineData(formatted);
          } else {
            setTimelineData([]);
          }

          if (rawAnoms.length > 0) {
            setTopLeak(rawAnoms[0]);
          } else {
            setTopLeak(null);
          }
        }
      } catch {
        if (isMounted) setTimelineData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTimeline();
    return () => {
      isMounted = false;
    };
  }, [currentFacilityId]);

  const hasData = timelineData.length > 0;

  const filteredData =
    activeShiftFilter === 'all'
      ? timelineData
      : timelineData.filter((d) => d.shift.toLowerCase() === activeShiftFilter);

  if (loading) {
    return (
      <SectionCard title="24-Hour Shift Telemetry & Carbon Profile">
        <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-mono">
          Loading shift telemetry from PostgreSQL...
        </div>
      </SectionCard>
    );
  }

  if (!hasData) {
    return (
      <SectionCard
        title="24-Hour Shift Telemetry & Operational Baseline"
        subtitle="Expected plant baseline vs actual measured telemetry"
      >
        <div className="h-44 border border-dashed border-[#232c3d] rounded-lg flex flex-col items-center justify-center text-center p-6 bg-[#0f1219]/60">
          <Activity className="w-8 h-8 text-slate-600 mb-2" />
          <h5 className="text-xs font-semibold text-slate-300">Telemetry Timeline Unavailable</h5>
          <p className="text-[11px] text-slate-500 max-w-sm mt-1">
            Ingest operational time-series data to render the 24-hour diurnal load vs baseline curve.
          </p>
        </div>
      </SectionCard>
    );
  }

  const currentPoint = timelineData[timelineData.length - 1] || timelineData[0];
  const isAnomaly = currentPoint.leak > 25 || !!topLeak;

  return (
    <SectionCard
      title="24-Hour Shift Telemetry & Operational Baseline"
      subtitle="Real-time diurnal emissions tracking: Expected plant baseline vs actual telemetry, pinpointing off-hours leak anomalies"
      badge={
        isAnomaly ? (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-semibold flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3" /> Anomaly Variance Detected
          </span>
        ) : (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Nominal Tracking
          </span>
        )
      }
      action={
        <div className="flex items-center gap-1.5 bg-[#121620] p-1 rounded-lg border border-[#202737]">
          {['all', 'night', 'morning'].map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveShiftFilter(mode)}
              className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                activeShiftFilter === mode
                  ? mode === 'night'
                    ? 'bg-red-900/80 text-red-200 font-semibold'
                    : 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode === 'all' ? '24h Diurnal' : mode === 'night' ? 'Night Shift' : 'Day Shift'}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Real-time telemetry metric badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-[#12161f] border border-[#1e2535] text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Active Shift</span>
            <span className="text-white font-bold text-sm block">{currentPoint.shift} Shift</span>
            <span className="text-[10px] text-slate-500">Live Operating Window</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Baseline Average</span>
            <span className="text-slate-300 font-bold text-sm block">{currentPoint.baseline} kgCO₂e/hr</span>
            <span className="text-[10px] text-slate-500">Nominal Process Load</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Measured Telemetry</span>
            <span className="text-red-400 font-bold text-sm block">{currentPoint.actual} kgCO₂e/hr</span>
            <span className="text-[10px] text-red-400 font-semibold">
              {currentPoint.actual >= currentPoint.baseline ? `+${Math.round(((currentPoint.actual - currentPoint.baseline) / Math.max(1, currentPoint.baseline)) * 100)}% Over Baseline` : 'Within Normal Range'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Monitored Asset</span>
            <span className="text-amber-400 font-bold text-sm block truncate">
              {topLeak?.equipment || 'Primary Industrial Units'}
            </span>
            <span className="text-[10px] text-amber-400/80 font-medium">
              {topLeak ? `${topLeak.deviation_percent}% deviation` : 'Baseline synchronized'}
            </span>
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
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="bg-[#121620] border border-[#2c374d] p-3 rounded-lg shadow-xl text-xs font-mono space-y-1">
                        <div className="flex items-center justify-between gap-3 text-slate-300 border-b border-[#232c3d] pb-1 font-bold">
                          <span>{label} ({dataPoint.shift} Shift)</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-400">
                          <span>Baseline:</span>
                          <strong>{dataPoint.baseline} kgCO₂e/hr</strong>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-red-400">
                          <span>Measured:</span>
                          <strong>{dataPoint.actual} kgCO₂e/hr</strong>
                        </div>
                        {dataPoint.leak > 0 && (
                          <div className="flex items-center justify-between gap-4 text-amber-300 pt-1 border-t border-[#1e2736]">
                            <span>Variance:</span>
                            <strong>+{dataPoint.leak} kgCO₂e/hr</strong>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

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

        {/* Legend */}
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
              {topLeak
                ? `Active anomaly: ${topLeak.equipment} (${topLeak.reason || 'Variance observed'})`
                : 'Diurnal profile derived dynamically from ingested operational timestamps.'}
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
