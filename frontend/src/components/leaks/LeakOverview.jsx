import React from 'react';
import { AlertOctagon, TrendingUp, AlertTriangle, ShieldAlert } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';

export function LeakOverview({ leaksData }) {
  const total = leaksData?.total_leaks || (Array.isArray(leaksData?.leaks) ? leaksData.leaks.length : 0);
  const highRisk = leaksData?.high_risk_count || 0;
  const aggregateLoss = leaksData?.aggregate_excess_emissions || 0;
  const highRiskEquipments = leaksData?.high_risk_equipment_list || (highRisk > 0 ? `${highRisk} flagged units` : 'No active alerts');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <MetricCard
        title="Total Flagged Anomalies"
        value={total}
        unit="Points Identified"
        subtext="Continuous anomaly scan"
        icon={AlertOctagon}
      />
      <MetricCard
        title="Critical & High-Risk"
        value={highRisk}
        unit="Require Immediate Service"
        subtext={highRiskEquipments}
        delta={highRisk > 0 ? "High Priority" : "Nominal"}
        deltaType={highRisk > 0 ? "positive_is_bad" : "positive_is_good"}
        highlight={highRisk > 0}
        icon={ShieldAlert}
      />
      <MetricCard
        title="Avoidable Emission Bleed"
        value={aggregateLoss.toLocaleString()}
        unit="kgCO₂e / day"
        subtext={aggregateLoss > 0 ? "Excess carbon loss above baseline" : "Zero active leakage"}
        delta={aggregateLoss > 0 ? "Active Loss" : "Optimal"}
        deltaType={aggregateLoss > 0 ? "positive_is_bad" : "positive_is_good"}
        icon={TrendingUp}
      />
    </div>
  );
}
