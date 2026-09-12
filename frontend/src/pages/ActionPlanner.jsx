import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { useRecommendations } from '../hooks/useRecommendations';
import { InterventionTimeline } from '../components/recommendations/InterventionTimeline';
import { PriorityMatrix } from '../components/recommendations/PriorityMatrix';
import { Button } from '../components/ui/Button';
import { Sliders, ListChecks, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export function ActionPlanner() {
  const { data, loading, error, refetch } = useRecommendations();

  if (loading) {
    return (
      <div>
        <PageHeader title="Intervention Action Planner" />
        <LoadingState rows={5} message="Sequencing implementation phases and schedules..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Intervention Action Planner" />
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  const phases = data?.action_plan_phases || data?.phases || [];
  const topAction = data?.items?.[0] || phases[0]?.interventions?.[0] || null;

  if (phases.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Intervention Action Planner"
          subtitle="Prioritized deployment sequence: What should the company do first, what are the costs, and when is breakeven?"
        />
        <EmptyState
          icon={ListChecks}
          title="No Action Plan Available"
          description="Action plans and implementation sequences are derived dynamically once operational telemetry has been ingested and anomalies analyzed."
          actionText="Upload Facility Telemetry"
          actionLink="/data-upload"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intervention Action Planner"
        subtitle="Prioritized deployment sequence: What should the company do first, what are the costs, and when is breakeven?"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            {phases.length} Deployment {phases.length === 1 ? 'Phase' : 'Phases'}
          </span>
        }
        actions={
          <Link to="/simulation">
            <Button variant="primary" size="sm" icon={Sliders}>
              Model Scenarios
            </Button>
          </Link>
        }
      />

      {/* Decision Summary Card: WHAT SHOULD WE DO FIRST? */}
      {topAction && (
        <div className="p-4 rounded bg-[#151d29] border border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-1">
              Top Priority Initial Action
            </span>
            <h3 className="text-sm font-semibold text-white">
              {topAction.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Targeting {topAction.target_equipment} ({topAction.target_process}). Estimated investment of {formatCurrency(topAction.investment)} delivers recurring annual savings of {formatCurrency(topAction.annual_savings)} with a payback period of {topAction.payback_years} years.
            </p>
          </div>
          <Link to="/leaks" className="shrink-0">
            <Button variant="secondary" size="sm" icon={ArrowRight}>
              Investigate Telemetry
            </Button>
          </Link>
        </div>
      )}

      <InterventionTimeline phases={phases} />

      {data?.priority_matrix && <PriorityMatrix matrix={data.priority_matrix} />}
    </div>
  );
}
export default ActionPlanner;
