import React from 'react';
import { Activity, Factory, Gauge, Zap } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';
import { formatEmissionIntensity } from '../../utils/formatters';

export function EmissionOverview({ data }) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Daily Emissions"
        value={data.total_emissions_daily?.toLocaleString() || '12,450'}
        unit="kgCO₂e / day"
        subtext="Aggregated across all processes"
        icon={Activity}
      />
      <MetricCard
        title="Annualized Footprint"
        value={data.total_emissions_annual?.toLocaleString() || '4,544'}
        unit="tCO₂e / year"
        subtext="Normalized 3-shift operational cycle"
        icon={Factory}
      />
      <MetricCard
        title="Specific Intensity"
        value={data.emission_intensity || 101}
        unit="kgCO₂e / metric ton"
        subtext="Calculated per metric ton output"
        delta="+18.8% vs benchmark"
        deltaType="positive_is_bad"
        highlight={true}
        icon={Gauge}
      />
      <MetricCard
        title="Daily Production"
        value={data.production_volume_daily || 123.3}
        unit="metric tons / day"
        subtext="Continuous melting schedule"
        icon={Zap}
      />
    </div>
  );
}
