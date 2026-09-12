import React from 'react';
import { Gauge, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';

export function LeakMetrics({ leak }) {
  if (!leak) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Anomaly Risk Score"
        value={leak.risk_score}
        unit="/ 100"
        subtext={`Severity: ${leak.risk_level}`}
        highlight={leak.risk_score >= 80}
        icon={AlertTriangle}
      />
      <MetricCard
        title="Daily Emission Loss"
        value={leak.emission_contribution?.toLocaleString()}
        unit="kgCO₂e / day"
        subtext="Avoidable waste load"
        delta={`+${leak.deviation_percent}%`}
        deltaType="positive_is_bad"
        icon={TrendingUp}
      />
      <MetricCard
        title="Observed Rate"
        value={leak.observed_consumption}
        unit={leak.consumption_unit}
        subtext={`Baseline: ${leak.baseline_consumption} ${leak.consumption_unit}`}
        icon={Zap}
      />
      <MetricCard
        title="Off-Hours Deviation"
        value={`+${leak.deviation_percent}%`}
        unit="Above Baseline"
        subtext={`During: ${leak.abnormal_period}`}
        deltaType="positive_is_bad"
        icon={Gauge}
      />
    </div>
  );
}
