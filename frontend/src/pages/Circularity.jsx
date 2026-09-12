import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { useCircularity } from '../hooks/useCircularity';
import { CircularityScore } from '../components/circularity/CircularityScore';
import { CircularityBreakdown } from '../components/circularity/CircularityBreakdown';
import { CircularityImprovement } from '../components/circularity/CircularityImprovement';
import { Button } from '../components/ui/Button';
import { FileText, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Circularity() {
  const { data, loading, error, refetch } = useCircularity();

  if (loading) {
    return (
      <div>
        <PageHeader title="Circularity Performance Index" />
        <LoadingState rows={5} message="Aggregating 5-pillar circularity assessment..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Circularity Performance Index" />
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Circularity Performance Index & Material Lifecycle"
        subtitle="Evaluating resource recovery, thermal loop recapture, and renewable power substitution"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Current: 64 / 100
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to="/simulation">
              <Button variant="outline" size="sm" icon={Sliders}>
                Simulate Uplift
              </Button>
            </Link>
            <Link to="/audit-report">
              <Button variant="primary" size="sm" icon={FileText}>
                Audit Report
              </Button>
            </Link>
          </div>
        }
      />

      <CircularityScore
        overallScore={data?.overall_score}
        projectedScore={data?.projected_score}
        tier={data?.tier}
      />

      <CircularityBreakdown pillars={data?.pillars} />

      <CircularityImprovement delta={data?.score_delta} />
    </div>
  );
}
export default Circularity;
