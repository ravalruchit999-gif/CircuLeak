import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { useDashboard } from '../hooks/useDashboard';
import { Button } from '../components/ui/Button';
import { Sliders, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { data, loading, error, refetch } = useDashboard();

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Executive Carbon Dashboard"
          subtitle="Real-time industrial emission intelligence and carbon leak diagnostics"
        />
        <LoadingState rows={6} message="Aggregating plant telemetry and emissions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Executive Carbon Dashboard"
          subtitle="Real-time industrial emission intelligence and carbon leak diagnostics"
        />
        <ErrorState
          title="Unable to Load Dashboard"
          message={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Executive Carbon Dashboard"
        subtitle="Industrial emission intelligence, flagged anomaly leaks, and circular savings opportunities"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Unit 4 Live
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to="/leaks">
              <Button variant="secondary" size="sm" icon={AlertTriangle}>
                Review 3 Leaks
              </Button>
            </Link>
            <Link to="/simulation">
              <Button variant="primary" size="sm" icon={Sliders}>
                Simulate Scenarios
              </Button>
            </Link>
          </div>
        }
      />

      <DashboardOverview data={data} />
    </div>
  );
}
export default Dashboard;
