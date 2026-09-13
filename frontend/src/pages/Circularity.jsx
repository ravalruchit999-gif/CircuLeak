import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { useCircularity } from '../hooks/useCircularity';
import { CircularityScore } from '../components/circularity/CircularityScore';
import { CircularityBreakdown } from '../components/circularity/CircularityBreakdown';
import { IndustrialSymbiosisCard } from '../components/circularity/IndustrialSymbiosisCard';
import { CCTSMonetizerCard } from '../components/simulation/CCTSMonetizerCard';
import { CircularityImprovement } from '../components/circularity/CircularityImprovement';
import { Button } from '../components/ui/Button';
import { FileText, Sliders, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Circularity() {
  const { data, symbiosisData, loading, error, refetch } = useCircularity();

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

  const hasData = data && data.has_data && data.overall_score > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Circularity Performance Index & Material Lifecycle"
          subtitle="Evaluating resource recovery, thermal loop recapture, and renewable power substitution"
        />
        <EmptyState
          icon={RefreshCw}
          title="Circularity Assessment Awaiting Telemetry"
          description="Circularity scoring evaluates material reuse, waste heat loops, and renewable power substitution from ingested operational energy and fuel data."
          actionText="Upload Telemetry Dataset"
          actionLink="/data-upload"
        />

        {data?.missing_inputs && data.missing_inputs.length > 0 && (
          <div className="bg-[#12161f] border border-[#1f2635] rounded p-5 max-w-lg mx-auto space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Required Telemetry Inputs
            </h4>
            <div className="space-y-2">
              {data.missing_inputs.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
            Current: {data.overall_score} / 100 ({data.tier || 'Score'})
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
        overallScore={data.overall_score}
        projectedScore={data.projected_score}
        tier={data.tier}
      />

      {data.pillars && data.pillars.length > 0 && (
        <CircularityBreakdown pillars={data.pillars} />
      )}

      {symbiosisData && symbiosisData.streams && symbiosisData.streams.length > 0 && (
        <IndustrialSymbiosisCard
          symbiosisData={symbiosisData}
          facilityId={data?.facility_id}
          onRefresh={refetch}
        />
      )}

      <CircularityImprovement delta={data.score_delta} />

      {/* National Carbon Credit Trading Scheme (BEE CCTS) Monetization */}
      <CCTSMonetizerCard
        facilityId={data?.facility_id}
        simulatedAbatementKg={0}
      />
    </div>
  );
}
export default Circularity;
