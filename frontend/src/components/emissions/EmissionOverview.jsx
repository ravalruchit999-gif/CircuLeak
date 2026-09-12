import React from 'react';
import { Activity, Factory, Gauge, Zap } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';
import { formatEmissionIntensity } from '../../utils/formatters';

export function EmissionOverview({ data }) {
  if (!data) return null;

  const totalDaily = (data.total_emissions || data.total_emissions_daily || 12450).toLocaleString();
  const totalAnnual = (data.total_emissions_tonnes || data.total_emissions_annual || 4544).toLocaleString();
  const intensity = data.emissions_intensity || data.emission_intensity || 101;
  const production = data.total_production_volume || data.production_volume_daily || 123.3;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Daily Emissions"
        value={totalDaily}
        unit="kgCO₂e / day"
        subtext="Aggregated across all processes"
        icon={Activity}
      />
      <MetricCard
        title="Annualized Footprint"
        value={totalAnnual}
        unit="tCO₂e / year"
        subtext="Normalized 3-shift operational cycle"
        icon={Factory}
      />
      <MetricCard
        title="Specific Intensity"
        value={intensity}
        unit="kgCO₂e / metric ton"
        subtext="Calculated per metric ton output"
        delta="+18.8% vs benchmark"
        deltaType="positive_is_bad"
        highlight={true}
        icon={Gauge}
      />
      <MetricCard
        title="Daily Production"
        value={production}
        unit="metric tons / day"
        subtext="Continuous melting schedule"
        icon={Zap}
      />
    </div>
  );
}
