import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { useTrajectory } from '../hooks/useTrajectory';
import { TrajectoryChart } from '../components/trajectory/TrajectoryChart';
import { TrajectorySummary } from '../components/trajectory/TrajectorySummary';
import { CumulativeImpact } from '../components/trajectory/CumulativeImpact';
import { RoadmapTimeline } from '../components/trajectory/RoadmapTimeline';
import { Button } from '../components/ui/Button';
import { BarChart3, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Trajectory() {
  const { data, loading, error, refetch } = useTrajectory();

  if (loading) {
    return (
      <div>
        <PageHeader title="5-Year Decarbonization Trajectory" />
        <LoadingState rows={6} message="Simulating 5-year multi-phase emissions trajectory..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="5-Year Decarbonization Trajectory" />
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="5-Year Decarbonization Trajectory & Long-Term Roadmap"
        subtitle="2026 to 2030 projection comparing Business-As-Usual against progressive CircuLeak interventions"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Net -49.2% by 2030
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to="/benchmark">
              <Button variant="outline" size="sm" icon={BarChart3}>
                Industry Benchmark
              </Button>
            </Link>
            <Link to="/audit-report">
              <Button variant="primary" size="sm" icon={FileText}>
                Executive Audit
              </Button>
            </Link>
          </div>
        }
      />

      <TrajectorySummary trajectory={data} />

      <TrajectoryChart projection={data?.yearly_projection} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CumulativeImpact yearlyData={data?.yearly_projection} />
        <RoadmapTimeline milestones={data?.roadmap_milestones} />
      </div>
    </div>
  );
}
export default Trajectory;
