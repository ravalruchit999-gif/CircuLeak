import React from 'react';
import { DollarSign, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';
import { formatCurrency, formatPayback } from '../../utils/formatters';

export function RecommendationImpact({ data }) {
  const totalReduction = data?.potential_co2_reduction_total || 0;
  const totalCapex = data?.total_investment || 0;
  const totalSavings = data?.total_annual_savings || 0;
  const payback = data?.overall_payback_years || 0;
  const reductionPct = data?.potential_reduction_percent || 0;
  const recCount = data?.total_recommendations || (Array.isArray(data?.recommendations) ? data.recommendations.length : 0);
  const netGain5yr = totalSavings * 5 - totalCapex;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Aggregate Abatement"
        value={totalReduction.toLocaleString()}
        unit="kgCO₂e / day"
        subtext={reductionPct > 0 ? `${reductionPct}% reduction of plant footprint` : 'Calculated actionable reduction'}
        delta={reductionPct > 0 ? `-${reductionPct}%` : null}
        deltaType="positive_is_good"
        icon={TrendingDown}
      />
      <MetricCard
        title="Total Implementation Capex"
        value={formatCurrency(totalCapex, true)}
        unit="One-time"
        subtext={`${recCount} prioritized intervention packages`}
        icon={DollarSign}
      />
      <MetricCard
        title="Annual Recurring Savings"
        value={formatCurrency(totalSavings, true)}
        unit="/ year"
        subtext="Direct operational resource recovery"
        delta={totalSavings > 0 ? "ROI Verified" : null}
        deltaType="positive_is_good"
        icon={CheckCircle2}
      />
      <MetricCard
        title="Combined Payback Period"
        value={formatPayback(payback)}
        unit={payback > 0 ? "Breakeven" : "Awaiting Actions"}
        subtext={`5-Yr Net: ${formatCurrency(netGain5yr, true)}`}
        highlight={payback > 0 && payback <= 2}
        icon={Clock}
      />
    </div>
  );
}
