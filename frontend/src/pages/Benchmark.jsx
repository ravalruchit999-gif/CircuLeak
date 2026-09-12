import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { useBenchmark } from '../hooks/useBenchmark';
import { BenchmarkMetrics } from '../components/benchmark/BenchmarkMetrics';
import { BenchmarkOverview } from '../components/benchmark/BenchmarkOverview';
import { BenchmarkComparison } from '../components/benchmark/BenchmarkComparison';
import { PeerCluster } from '../components/benchmark/PeerCluster';
import { Button } from '../components/ui/Button';
import { RefreshCw, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Benchmark() {
  const { industryBenchmark, peerCluster, loading, error, refetch } = useBenchmark();

  if (loading) {
    return (
      <div>
        <PageHeader title="Industry & Peer Benchmarking" />
        <LoadingState rows={5} message="Comparing plant intensity against regional sector cohort..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Industry & Peer Benchmarking" />
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Industry Benchmark & Machine-Learned Peer Clustering"
        subtitle="Evaluating carbon intensity (kgCO₂e / metric ton product) against regional alloy casting manufacturing cohort"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
            Intensity Gap: +18.8%
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to="/circularity">
              <Button variant="outline" size="sm" icon={RefreshCw}>
                Circularity Index
              </Button>
            </Link>
            <Link to="/audit-report">
              <Button variant="primary" size="sm" icon={FileText}>
                Audit Memorandum
              </Button>
            </Link>
          </div>
        }
      />

      <BenchmarkMetrics
        industryBenchmark={industryBenchmark}
        peerCluster={peerCluster}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col">
          <BenchmarkOverview benchmark={industryBenchmark} />
        </div>
        <div className="flex flex-col">
          <BenchmarkComparison
            facilityIntensity={industryBenchmark?.facility_intensity}
            benchmarkAverage={industryBenchmark?.benchmark_average}
          />
        </div>
      </div>

      <PeerCluster cluster={peerCluster} />
    </div>
  );
}
export default Benchmark;
