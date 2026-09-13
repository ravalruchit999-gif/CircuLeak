import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { useLeaks } from '../hooks/useLeaks';
import { LeakOverview } from '../components/leaks/LeakOverview';
import { LeakTable } from '../components/leaks/LeakTable';
import { HotspotVisualization } from '../components/leaks/HotspotVisualization';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export function Leaks() {
  const { leaksData, loading, error, refetch } = useLeaks();

  if (loading) {
    return (
      <div>
        <PageHeader title="Carbon Leak Points & Anomalies" />
        <LoadingState rows={5} message="Scanning baseline telemetry for consumption deviations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Carbon Leak Points & Anomalies" />
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  const hasLeaks = leaksData && Array.isArray(leaksData.leaks) && leaksData.leaks.length > 0;

  if (!hasLeaks) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Carbon Leak Points & Anomaly Diagnostics"
          subtitle="Uncover equipment operating above baseline thresholds, off-hours bypass bleeds, and thermal dissipation"
        />
        <EmptyState
          icon={ShieldCheck}
          title="No Anomalies or Leaks Detected"
          description="Monitored equipment is currently operating within expected baseline consumption boundaries, or no operational logs have been ingested yet."
          actionText="Upload Telemetry Dataset"
          actionLink="/data-upload"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carbon Leak Points & Anomaly Diagnostics"
        subtitle="Uncover equipment operating above baseline thresholds, off-hours bypass bleeds, and thermal dissipation"
        badge={
          leaksData.high_risk_count > 0 ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
              {leaksData.high_risk_count} High-Risk {leaksData.high_risk_count === 1 ? 'Leak' : 'Leaks'}
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              {leaksData.total_leaks} Minor Variances
            </span>
          )
        }
      />

      <LeakOverview leaksData={leaksData} />

      <LeakTable leaks={leaksData.leaks} />

      {leaksData.hotspots_flow && (
        <HotspotVisualization hotspotsFlow={leaksData.hotspots_flow} />
      )}
    </div>
  );
}
export default Leaks;
