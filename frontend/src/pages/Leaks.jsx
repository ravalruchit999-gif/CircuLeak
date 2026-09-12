import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { useLeaks } from '../hooks/useLeaks';
import { LeakOverview } from '../components/leaks/LeakOverview';
import { LeakTable } from '../components/leaks/LeakTable';
import { HotspotVisualization } from '../components/leaks/HotspotVisualization';

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carbon Leak Points & Anomaly Diagnostics"
        subtitle="Uncover equipment operating above baseline thresholds, off-hours bypass bleeds, and thermal dissipation"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
            3 High-Risk Leaks
          </span>
        }
      />

      <LeakOverview leaksData={leaksData} />

      <LeakTable leaks={leaksData?.leaks} />

      <HotspotVisualization hotspotsFlow={leaksData?.hotspots_flow} />
    </div>
  );
}
export default Leaks;
