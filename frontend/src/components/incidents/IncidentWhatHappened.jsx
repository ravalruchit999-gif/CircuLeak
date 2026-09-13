import React from 'react';
import { AlertCircle, HelpCircle, ArrowUpRight, Gauge, Clock, Layers } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';

export function IncidentWhatHappened({ incident, observed, baseline, deviation, reason }) {
  const summaryText =
    reason ||
    "An operational anomaly was detected. The available data does not establish a specific physical cause.";

  const hasObserved = observed && observed.value !== undefined && observed.value !== null;
  const hasBaseline = baseline && baseline.value !== undefined && baseline.value !== null;
  const hasDeviation = deviation && deviation.percent !== undefined && deviation.percent !== null;

  return (
    <SectionCard
      title="WHAT HAPPENED?"
      subtitle="Operational divergence detected against historical active operational baselines"
      className="mb-6 border-red-950/40"
    >
      {/* Human-Readable Structured Narrative */}
      <div className="p-4 rounded-lg bg-red-950/20 border border-red-900/30 mb-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-red-400 block mb-1">
              OBSERVED OPERATIONAL BEHAVIOR
            </span>
            <p className="text-sm font-medium text-slate-100 leading-relaxed font-sans">
              "{summaryText}"
            </p>
          </div>
        </div>
      </div>

      {/* 3-Column Metric Comparison: Observed vs Baseline vs Deviation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Observed Value */}
        <div className="p-4 rounded-lg bg-[#141824] border border-[#21293c]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="uppercase tracking-wider font-mono text-[11px]">Observed Metric</span>
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">
            {hasObserved ? `${observed.value.toLocaleString()} ` : 'Unavailable '}
            <span className="text-xs font-normal text-slate-400">{observed?.unit || ''}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Target: {observed?.metric_name || 'Electricity Consumption'}
          </p>
        </div>

        {/* Expected Baseline */}
        <div className="p-4 rounded-lg bg-[#141824] border border-[#21293c]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="uppercase tracking-wider font-mono text-[11px]">Expected Baseline</span>
            <Layers className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">
            {hasBaseline ? `${baseline.value.toLocaleString()} ` : 'Unavailable '}
            <span className="text-xs font-normal text-slate-400">{baseline?.unit || ''}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate" title={baseline?.reference_description}>
            Method: {baseline?.methodology || 'Historical Active Baseline'}
          </p>
        </div>

        {/* Deviation */}
        <div className="p-4 rounded-lg bg-[#141824] border border-[#21293c]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="uppercase tracking-wider font-mono text-[11px]">Deviation</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">
            {hasDeviation ? `+${deviation.percent}%` : 'Unavailable'}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {hasDeviation && deviation.absolute_difference !== undefined
              ? `+${deviation.absolute_difference.toLocaleString()} ${observed?.unit || ''} excess`
              : 'Relative variance calculated by backend'}
          </p>
        </div>
      </div>

      {/* Operational Window & Duration Meta */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1e2536] text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Incident Window:</span>
          <strong className="text-slate-200">
            {incident?.start_time && incident?.end_time
              ? `${incident.start_time} → ${incident.end_time}`
              : incident?.start_time || 'Operating Hours'}
          </strong>
        </div>
        <div>
          <span>Reference Methodology: </span>
          <span className="text-slate-300">
            {baseline?.reference_description || 'Active production cycles filtered for uncharacteristic idle bleed'}
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
