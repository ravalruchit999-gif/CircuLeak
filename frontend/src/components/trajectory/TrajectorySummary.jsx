import React from 'react';
import { TrendingDown, DollarSign, Target, Calendar } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';
import { formatCurrency } from '../../utils/formatters';

export function TrajectorySummary({ trajectory }) {
  const hasData = trajectory?.has_data !== false && (trajectory?.yearly_projection?.length > 0 || trajectory?.trajectory?.length > 0);
  const avoidedTonnes = hasData 
    ? (trajectory?.cumulative_co2_avoided_tonnes ?? (trajectory?.summary?.cumulative_co2_avoided ? Math.round(trajectory.summary.cumulative_co2_avoided / 1000) : 0))
    : 0;
  const cumulativeSavings = hasData
    ? (trajectory?.cumulative_financial_savings ?? trajectory?.summary?.cumulative_financial_savings ?? 0)
    : 0;
  const targetIntensity = hasData && trajectory?.target_emissions
    ? Math.round(trajectory.target_emissions / 1000).toLocaleString()
    : '—';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="5-Year CO₂ Avoided"
        value={hasData ? avoidedTonnes.toLocaleString() : '0'}
        unit="metric tons"
        subtext={hasData ? "Cumulative avoided plant emissions" : "Awaiting telemetry ingestion"}
        delta={hasData ? "Projected Impact" : "No Baseline"}
        deltaType={hasData ? "positive_is_good" : "neutral"}
        icon={TrendingDown}
      />
      <MetricCard
        title="5-Year Cumulative Savings"
        value={hasData ? formatCurrency(cumulativeSavings, true) : '₹0'}
        unit="Gross Savings"
        subtext={hasData ? "Operational energy cost cuts" : "Requires active telemetry"}
        delta={hasData ? "Yield Projection" : "Pending"}
        deltaType={hasData ? "positive_is_good" : "neutral"}
        highlight={hasData}
        icon={DollarSign}
      />
      <MetricCard
        title="2030 Target Emissions"
        value={targetIntensity}
        unit={hasData ? "tonnes CO₂e / yr" : "Unset"}
        subtext={hasData ? "Phased abatement trajectory goal" : "Awaiting facility baseline"}
        icon={Target}
      />
      <MetricCard
        title="Planning Horizon"
        value="2026 — 2030"
        unit="5 Phases"
        subtext="Aligned with ISO 50001 targets"
        icon={Calendar}
      />
    </div>
  );
}

