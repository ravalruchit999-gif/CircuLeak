import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { useRecommendations } from '../hooks/useRecommendations';
import { InterventionTimeline } from '../components/recommendations/InterventionTimeline';
import { PriorityMatrix } from '../components/recommendations/PriorityMatrix';
import { SectionCard } from '../components/ui/SectionCard';
import { Button } from '../components/ui/Button';
import { Sliders, CheckCircle2, ArrowRight } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intervention Action Planner"
        subtitle="Prioritized deployment sequence: What should the company do first, what are the costs, and when is breakeven?"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Immediate: Phase 1
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
      <div className="p-4 rounded bg-[#151d29] border border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-1">
            Immediate Recommended Action (Month 1-2)
          </span>
          <h3 className="text-sm font-semibold text-white">
            Compressor 03 Off-Hours Sequencing & Unloader Servicing
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Requires only ₹80,000 in capital outlay and pays back in just 0.5 years (6 months), eliminating 950 kgCO₂e/day of idle bleed immediately.
          </p>
        </div>
        <Link to="/leaks/LEAK-01" className="shrink-0">
          <Button variant="secondary" size="sm" icon={ArrowRight}>
            View Compressor Leak
          </Button>
        </Link>
      </div>

      <InterventionTimeline phases={data?.action_plan_phases} />

      <PriorityMatrix matrix={data?.priority_matrix} />
    </div>
  );
}
export default ActionPlanner;
