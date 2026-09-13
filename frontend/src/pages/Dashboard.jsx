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

  const leakCount = data?.anomalies_count ?? (data?.active_leaks_count ?? (data?.leaks?.length ?? 0));
  const facilityLabel = data?.facility?.business_name || 'Telemetry Feed Active';

  return (
    <div>
      <PageHeader
        title="Executive Carbon Dashboard"
        subtitle="Industrial emission intelligence, flagged anomaly leaks, and circular savings opportunities"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            {facilityLabel}
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to="/leaks">
              <Button variant="secondary" size="sm" icon={AlertTriangle}>
                {leakCount > 0 ? `Review ${leakCount} ${leakCount === 1 ? 'Leak' : 'Leaks'}` : 'View Leaks'}
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

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 border-b border-[#1b2230]">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 shadow-sm"
        >
          <span>Executive Overview</span>
        </Link>
        <Link
          to="/emissions"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-colors"
        >
          <span>Scope 1 & 2 Emissions</span>
        </Link>
        <Link
          to="/benchmark"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-colors"
        >
          <span>Peer Benchmarking</span>
        </Link>
        <Link
          to="/circularity"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-colors"
        >
          <span>Circularity Index (MCI)</span>
        </Link>
        <Link
          to="/data-upload"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-colors ml-auto"
        >
          <span>+ Upload Telemetry</span>
        </Link>
      </div>

      <DashboardOverview data={data} />
    </div>
  );
}

export default Dashboard;
