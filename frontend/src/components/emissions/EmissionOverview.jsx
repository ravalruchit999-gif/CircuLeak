import React from 'react';
import { Activity, Factory, Gauge, Zap } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';
import { formatEmissionIntensity } from '../../utils/formatters';

export function EmissionOverview({ data }) {
  if (!data) return null;

  const totalDaily = Number(data.total_emissions || data.total_emissions_daily || 0);
  const totalAnnual = Number(data.total_emissions_tonnes || data.total_emissions_annual || Math.round(totalDaily * 365 / 1000));
  const intensity = Number(data.emissions_intensity || data.emission_intensity || 0);
  const production = Number(data.total_production_volume || data.production_volume_daily || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Daily Emissions"
        value={totalDaily.toLocaleString()}
        unit="kgCO₂e / day"
        subtext="Aggregated across all processes"
        icon={Activity}
      />
      <MetricCard
        title="Annualized Footprint"
        value={totalAnnual.toLocaleString()}
        unit="tCO₂e / year"
        subtext="Normalized operational baseline"
        icon={Factory}
      />
      <MetricCard
        title="Specific Intensity"
        value={intensity > 0 ? intensity : '0.0'}
        unit="kgCO₂e / metric ton"
        subtext="Calculated per unit output"
        delta={intensity > 0 ? `${intensity} kg/t` : null}
        deltaType="neutral"
        highlight={intensity > 0}
        icon={Gauge}
      />
      <MetricCard
        title="Daily Production"
        value={production.toLocaleString()}
        unit="metric tons / day"
        subtext="Active production records"
        icon={Zap}
      />
    </div>
  );
}
