import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

// Simulation components & hook
import { useSimulation } from '../hooks/useSimulation';
import { SimulationControls } from '../components/simulation/SimulationControls';
import { InterventionSelector } from '../components/simulation/InterventionSelector';
import { SimulationResults } from '../components/simulation/SimulationResults';
import { FinancialImpact } from '../components/simulation/FinancialImpact';
import { ScenarioComparison } from '../components/simulation/ScenarioComparison';
import { CCTSMonetizerCard } from '../components/simulation/CCTSMonetizerCard';

// Action Planner components & hook
import { useRecommendations } from '../hooks/useRecommendations';
import { InterventionTimeline } from '../components/recommendations/InterventionTimeline';
import { PriorityMatrix } from '../components/recommendations/PriorityMatrix';

// Trajectory components & hook
import { useTrajectory } from '../hooks/useTrajectory';
import { TrajectoryChart } from '../components/trajectory/TrajectoryChart';
import { TrajectorySummary } from '../components/trajectory/TrajectorySummary';
import { CumulativeImpact } from '../components/trajectory/CumulativeImpact';
import { RoadmapTimeline } from '../components/trajectory/RoadmapTimeline';

import {
  Sliders,
  ListChecks,
  TrendingDown,
  FileText,
  Sparkles,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function StrategySandbox() {
  const [activeTab, setActiveTab] = useState('simulation'); // 'simulation' | 'roadmap' | 'trajectory'

  // Hooks for each strategic view
  const sim = useSimulation();
  const plan = useRecommendations();
  const traj = useTrajectory();

  const isGlobalLoading = sim.loading && plan.loading && traj.loading;

  if (isGlobalLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Decarbonization Strategy Sandbox"
          subtitle="Interactive scenario simulation, phased capital roadmap, and 5-year SBTi net-zero modeling"
        />
        <LoadingState rows={6} message="Calibrating strategy models, economic returns, and abatement curves..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2738] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 rounded bg-purple-950/60 border border-purple-800/60 text-purple-400">
              <Sliders className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-semibold">
              Strategic Decision Studio
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Decarbonization Sandbox
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Test custom economic parameters, sequence Capex rollout phases, and verify 2030 SBTi compliance.
          </p>
        </div>

        {/* Studio Sub-view Switcher Tabs */}
        <div className="flex items-center p-1 bg-[#121622] rounded-lg border border-[#1f2738] shrink-0">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'simulation'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>What-If Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'roadmap'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Action Roadmap (Gantt)</span>
          </button>

          <button
            onClick={() => setActiveTab('trajectory')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'trajectory'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>5-Year SBTi Trajectory</span>
          </button>
        </div>
      </div>

      {/* TAB 1: WHAT-IF SIMULATOR */}
      {activeTab === 'simulation' && (
        <div className="space-y-6">
          {sim.error ? (
            <ErrorState message={sim.error} />
          ) : sim.availableInterventions.length === 0 && sim.scenarios.length === 0 ? (
            <EmptyState
              icon={Cpu}
              title="No Simulation Baseline Available"
              description="What-if modeling requires facility operational telemetry to establish baseline energy and emission curves."
              actionText="Upload Facility Telemetry"
              actionLink="/data-upload"
            />
          ) : (
            <>
              {/* Top Simulation Controls */}
              <SimulationControls
                scenarios={sim.scenarios}
                activeScenarioId={sim.activeScenarioId}
                onApplyScenario={sim.applyScenario}
                simulating={sim.simulating}
              />

              {/* Modeled Outcomes: Carbon Impact & Financial ROI Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimulationResults
                  result={sim.simulationResult}
                  loading={sim.simulating}
                />
                <FinancialImpact result={sim.simulationResult} />
              </div>

              {/* National Carbon Market (BEE CCTS) Monetization Module */}
              <CCTSMonetizerCard
                facilityId={sim.facilityId}
                simulatedAbatementKg={sim.simulationResult?.total_reduction}
                investmentInr={sim.simulationResult?.investment}
                annualSavingsInr={sim.simulationResult?.annual_savings}
              />

              {/* Candidate Interventions Catalog */}
              <InterventionSelector
                interventions={sim.availableInterventions}
                selectedIds={sim.selectedInterventions}
                onToggle={sim.toggleIntervention}
              />

              {/* Strategic Scenario Tradeoff Table */}
              <ScenarioComparison
                scenarios={sim.scenarios}
                activeScenarioId={sim.activeScenarioId}
                onSelectScenario={sim.applyScenario}
              />
            </>
          )}
        </div>
      )}

      {/* TAB 2: ACTION ROADMAP (GANTT & 2x2 MATRIX) */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          {plan.error ? (
            <ErrorState message={plan.error} onRetry={plan.refetch} />
          ) : (plan.data?.action_plan_phases || plan.data?.phases || []).length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No Action Plan Available"
              description="Action plans and implementation sequences are derived dynamically once operational telemetry has been ingested."
              actionText="Upload Facility Telemetry"
              actionLink="/data-upload"
            />
          ) : (
            <>
              {/* Top Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#10141e] to-cyan-950/30 border border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Sequential Decarbonization Deployment
                    </h3>
                    <p className="text-xs text-slate-400">
                      Phase A (0–3m Quick Wins) funds Phase B (3–9m Medium) and Phase C (Strategic Projects).
                    </p>
                  </div>
                </div>

                <Link
                  to="/audit-report"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shrink-0"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export Plan to Audit Pack</span>
                </Link>
              </div>

              {/* Phased Timeline (Gantt) */}
              <InterventionTimeline phases={plan.data?.action_plan_phases || plan.data?.phases || []} />

              {/* 2x2 Priority Matrix */}
              <PriorityMatrix
                interventions={plan.data?.items || []}
                phases={plan.data?.action_plan_phases || plan.data?.phases || []}
              />
            </>
          )}
        </div>
      )}

      {/* TAB 3: 5-YEAR SBTI TRAJECTORY */}
      {activeTab === 'trajectory' && (
        <div className="space-y-6">
          {traj.error ? (
            <ErrorState message={traj.error} onRetry={traj.refetch} />
          ) : !traj.data?.has_data ? (
            <EmptyState
              icon={TrendingDown}
              title="Trajectory Modeling Requires Baseline Telemetry"
              description="5-year decarbonization modeling and dynamic roadmap sequencing require operational telemetry."
              actionText="Upload Telemetry Dataset"
              actionLink="/data-upload"
            />
          ) : (
            <>
              {/* Summary KPIs */}
              <TrajectorySummary data={traj.data} />

              {/* Interactive Trajectory Chart */}
              <TrajectoryChart data={traj.data} />

              {/* Cumulative Impact & Milestone Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <CumulativeImpact data={traj.data} />
                </div>
                <div className="lg:col-span-7">
                  <RoadmapTimeline data={traj.data} />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default StrategySandbox;
