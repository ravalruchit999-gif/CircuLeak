import React from 'react';
import { Gauge, Users, TrendingUp, Award } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';

export function BenchmarkMetrics({ industryBenchmark, peerCluster }) {
  const facilityIntensity = Number(industryBenchmark?.facility_intensity || 0);
  const sectorAverage = Number(industryBenchmark?.benchmark_average || 0);
  const gap = Number(industryBenchmark?.difference_percent || 0);
  const isInsufficient = peerCluster?.has_peer_data === false || peerCluster?.status === "insufficient_data";
  const clusterCount = Number(peerCluster?.peer_cohort_size || peerCluster?.similar_facility_count || 0);
  const clusterDisplay = isInsufficient ? 'Pending' : clusterCount;
  const clusterSubtext = isInsufficient ? 'Requires >= 10 sector peers' : 'Classified by operational profile';
  const unit = industryBenchmark?.unit || 'kgCO₂e / unit';
  const targetIntensity = facilityIntensity > 0 ? (facilityIntensity * 0.75).toFixed(1) : '0.0';
  const sectorName = industryBenchmark?.sector || 'Manufacturing Sector';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Facility Intensity"
        value={facilityIntensity > 0 ? facilityIntensity : '0.0'}
        unit={unit}
        subtext="Normalized operational output"
        delta={gap !== 0 ? `${gap > 0 ? `+${gap}` : gap}% vs Benchmark` : 'At Benchmark'}
        deltaType={gap > 0 ? "positive_is_bad" : "positive_is_good"}
        highlight={gap > 0}
        icon={Gauge}
      />
      <MetricCard
        title="Sector Average"
        value={sectorAverage > 0 ? sectorAverage : '0.0'}
        unit={unit}
        subtext={`${sectorName} reference baseline`}
        icon={TrendingUp}
      />
      <MetricCard
        title="Peer Cluster Cohort"
        value={clusterDisplay}
        unit={isInsufficient ? "Defensibility Guard" : "Similar Facilities"}
        subtext={clusterSubtext}
        icon={Users}
      />

      <MetricCard
        title="Target After Interventions"
        value={targetIntensity}
        unit={unit}
        subtext="Calculated top quartile target"
        delta={facilityIntensity > 0 ? "Achievable" : null}
        deltaType="positive_is_good"
        icon={Award}
      />
    </div>
  );
}
