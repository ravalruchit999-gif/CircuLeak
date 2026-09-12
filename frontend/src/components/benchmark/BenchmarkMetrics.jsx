import React from 'react';
import { Gauge, Users, TrendingUp, Award } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';

export function BenchmarkMetrics({ industryBenchmark, peerCluster }) {
  const facilityIntensity = industryBenchmark?.facility_intensity || 101;
  const sectorAverage = industryBenchmark?.benchmark_average || 85;
  const gap = industryBenchmark?.difference_percent || 18.8;
  const clusterCount = peerCluster?.similar_facility_count || 24;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Facility Intensity"
        value={facilityIntensity}
        unit="kgCO₂e / metric ton product"
        subtext="Normalized production output"
        delta={`+${gap}% vs Benchmark`}
        deltaType="positive_is_bad"
        highlight={true}
        icon={Gauge}
      />
      <MetricCard
        title="Sector Average"
        value={sectorAverage}
        unit="kgCO₂e / metric ton product"
        subtext="Regional alloy casting benchmark"
        icon={TrendingUp}
      />
      <MetricCard
        title="Peer Cluster Size"
        value={clusterCount}
        unit="Similar Facilities"
        subtext="Clustered by volume & melt type"
        icon={Users}
      />
      <MetricCard
        title="Target After Interventions"
        value="75.4"
        unit="kgCO₂e / metric ton product"
        subtext="Places plant in Top Quartile"
        delta="Achievable"
        deltaType="positive_is_good"
        icon={Award}
      />
    </div>
  );
}
