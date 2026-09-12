import React from 'react';
import { AlertOctagon, TrendingUp, AlertTriangle, ShieldAlert } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';

export function LeakOverview({ leaksData }) {
  const total = leaksData?.total_leaks || 7;
  const highRisk = leaksData?.high_risk_count || 3;
  const aggregateLoss = leaksData?.aggregate_excess_emissions || 3150;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <MetricCard
        title="Total Flagged Anomalies"
        value={total}
        unit="Points Identified"
        subtext="Continuous operational scan"
        icon={AlertOctagon}
      />
      <MetricCard
        title="Critical & High-Risk"
        value={highRisk}
        unit="Require Immediate Service"
        subtext="Compressor & Furnace lines"
        delta="High Priority"
        deltaType="positive_is_bad"
        highlight={true}
        icon={ShieldAlert}
      />
      <MetricCard
        title="Avoidable Emission Bleed"
        value={aggregateLoss.toLocaleString()}
        unit="kgCO₂e / day"
        subtext="25.3% of total facility footprint"
        delta="+45% peak deviation"
        deltaType="positive_is_bad"
        icon={TrendingUp}
      />
    </div>
  );
}
