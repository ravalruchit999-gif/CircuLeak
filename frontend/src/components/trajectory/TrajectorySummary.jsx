import React from 'react';
import { TrendingDown, DollarSign, Target, Calendar } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';
import { formatCurrency } from '../../utils/formatters';

export function TrajectorySummary({ trajectory }) {
  const avoidedTonnes = trajectory?.cumulative_co2_avoided_tonnes || 4850;
  const cumulativeSavings = trajectory?.cumulative_financial_savings || 2100000;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="5-Year CO₂ Avoided"
        value={avoidedTonnes.toLocaleString()}
        unit="metric tons"
        subtext="Cumulative avoided plant emissions"
        delta="Long-Term Impact"
        deltaType="positive_is_good"
        icon={TrendingDown}
      />
      <MetricCard
        title="5-Year Cumulative Savings"
        value={formatCurrency(cumulativeSavings, true)}
        unit="Gross Savings"
        subtext="Operational energy cost cuts"
        delta="Verified Yield"
        deltaType="positive_is_good"
        highlight={true}
        icon={DollarSign}
      />
      <MetricCard
        title="2030 Intensity Goal"
        value="55"
        unit="kgCO₂e / ton product"
        subtext="Global Top Decile Performance"
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
