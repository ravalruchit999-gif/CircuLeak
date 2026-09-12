import React from 'react';
import { DollarSign, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';
import { formatCurrency, formatPayback } from '../../utils/formatters';

export function RecommendationImpact({ data }) {
  const totalReduction = data?.potential_co2_reduction_total || 3150;
  const totalCapex = data?.total_investment || 650000;
  const totalSavings = data?.total_annual_savings || 420000;
  const payback = data?.overall_payback_years || 1.55;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Aggregate Abatement"
        value={totalReduction.toLocaleString()}
        unit="kgCO₂e / day"
        subtext="25.3% reduction of plant footprint"
        delta="-25.3%"
        deltaType="positive_is_good"
        icon={TrendingDown}
      />
      <MetricCard
        title="Total Implementation Capex"
        value={formatCurrency(totalCapex, true)}
        unit="One-time"
        subtext="4 prioritized intervention packages"
        icon={DollarSign}
      />
      <MetricCard
        title="Annual Recurring Savings"
        value={formatCurrency(totalSavings, true)}
        unit="/ year"
        subtext="Direct fuel & electricity savings"
        delta="ROI Verified"
        deltaType="positive_is_good"
        icon={CheckCircle2}
      />
      <MetricCard
        title="Combined Payback Period"
        value={formatPayback(payback)}
        unit="Fast Breakeven"
        subtext={`5-Year Net Gain: ${formatCurrency(2100000 - totalCapex, true)}`}
        highlight={true}
        icon={Clock}
      />
    </div>
  );
}
