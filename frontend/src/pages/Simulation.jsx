import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { useSimulation } from '../hooks/useSimulation';
import { SimulationControls } from '../components/simulation/SimulationControls';
import { InterventionSelector } from '../components/simulation/InterventionSelector';
import { SimulationResults } from '../components/simulation/SimulationResults';
import { FinancialImpact } from '../components/simulation/FinancialImpact';
import { ScenarioCard } from '../components/simulation/ScenarioCard';
import { Button } from '../components/ui/Button';
import { TrendingDown, FileText, Upload, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Simulation() {
  const {
    scenarios,
    availableInterventions,
    selectedInterventions,
    simulationResult,
    activeScenarioId,
    loading,
    simulating,
    error,
    toggleIntervention,
    applyScenario,
  } = useSimulation();

  if (loading) {
    return (
      <div>
        <PageHeader title="What-If Carbon & Financial Simulator" />
        <LoadingState rows={6} message="Calibrating simulation baseline and economic returns..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="What-If Carbon & Financial Simulator" />
        <ErrorState message={error} />
      </div>
    );
  }

  if (availableInterventions.length === 0 && scenarios.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="What-If Carbon & Financial Simulator"
          subtitle="Model intervention bundles, evaluate Capex vs OPEX recovery, and project emissions abatement"
        />
        <EmptyState
          icon={Cpu}
          title="No Simulation Baseline Available"
          description="What-if modeling and scenario simulations require facility operational telemetry to establish baseline energy and emission curves."
          actionText="Upload Facility Telemetry"
          actionLink="/data-upload"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="What-If Carbon & Financial Simulator"
        subtitle="Model intervention bundles, evaluate Capex vs OPEX recovery, and project emissions abatement"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Interactive Model
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to="/trajectory">
              <Button variant="outline" size="sm" icon={TrendingDown}>
                5-Year Trajectory
              </Button>
            </Link>
            <Link to="/audit-report">
              <Button variant="primary" size="sm" icon={FileText}>
                Generate Audit Report
              </Button>
            </Link>
          </div>
        }
      />

      {/* Preset Strategy Cards */}
      {scenarios.length > 0 && (
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
            Strategic Scenario Presets
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((scen) => (
              <ScenarioCard
                key={scen.id}
                scenario={scen}
                isActive={activeScenarioId === scen.id}
                onSelect={applyScenario}
              />
            ))}
          </div>
        </div>
      )}

      {/* Simulator Interactive Work Area */}
      <SimulationControls
        selectedCount={selectedInterventions.length}
        totalCount={availableInterventions.length}
        onReset={() => applyScenario(scenarios[1] || scenarios[0])}
        simulating={simulating}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <InterventionSelector
          interventions={availableInterventions}
          selectedIds={selectedInterventions}
          onToggle={toggleIntervention}
        />

        <div className="space-y-6">
          <SimulationResults result={simulationResult} />
          <FinancialImpact result={simulationResult} />
        </div>
      </div>
    </div>
  );
}
export default Simulation;
