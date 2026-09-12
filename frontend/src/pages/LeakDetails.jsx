import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { useLeaks } from '../hooks/useLeaks';
import { LeakMetrics } from '../components/leaks/LeakMetrics';
import { LeakExplanation } from '../components/leaks/LeakExplanation';
import { LeakTimeline } from '../components/leaks/LeakTimeline';
import { LeakRiskBadge } from '../components/leaks/LeakRiskBadge';
import { Button } from '../components/ui/Button';
import { Sparkles, ArrowLeft, Sliders } from 'lucide-react';

export function LeakDetails() {
  const { id } = useParams();
  const { selectedLeak, loading, error, refetch } = useLeaks(id || 'LEAK-01');

  if (loading) {
    return (
      <div>
        <PageHeader title="Leak Diagnostic Detail" />
        <LoadingState rows={6} message="Retrieving root-cause explanation and baseline comparison..." />
      </div>
    );
  }

  if (error || !selectedLeak) {
    return (
      <div>
        <PageHeader title="Leak Diagnostic Detail" />
        <ErrorState message={error || 'Anomaly record not found'} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Diagnostic: ${selectedLeak.equipment}`}
        subtitle={`Anomaly Reference: ${selectedLeak.id} • ${selectedLeak.process} • Location: ${selectedLeak.location}`}
        badge={<LeakRiskBadge score={selectedLeak.risk_score} level={selectedLeak.risk_level} />}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/leaks">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back to Registry
              </Button>
            </Link>
            <Link to="/simulation">
              <Button variant="primary" size="sm" icon={Sliders}>
                Model In What-If
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <LeakMetrics leak={selectedLeak} />

      {/* Centerpiece: "WHY WAS THIS FLAGGED?" */}
      <LeakExplanation leak={selectedLeak} />

      {/* 24-Hour Observed Operating Data Window */}
      {selectedLeak.hourly_observed_data && selectedLeak.hourly_observed_data.length > 0 && (
        <LeakTimeline timeline={selectedLeak.hourly_observed_data} />
      )}

      {/* Next Step Callout */}
      <div className="p-4 rounded bg-[#131720] border border-[#212838] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
            Ready to resolve this leak anomaly?
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            CircuLeak circular intelligence has formulated 4 engineering recommendations for this machine.
          </p>
        </div>
        <Link to="/recommendations">
          <Button variant="secondary" size="sm" icon={Sparkles}>
            Explore Circular Solutions
          </Button>
        </Link>
      </div>
    </div>
  );
}
export default LeakDetails;
