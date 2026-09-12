import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { useSimulation } from '../hooks/useSimulation';
import { SimulationControls } from '../components/simulation/SimulationControls';
import { InterventionSelector } from '../components/simulation/InterventionSelector';
import { SimulationResults } from '../components/simulation/SimulationResults';
import { FinancialImpact } from '../components/simulation/FinancialImpact';
import { ScenarioCard } from '../components/simulation/ScenarioCard';
import { ScenarioComparison } from '../components/simulation/ScenarioComparison';
import { simulationMock } from '../data/simulationMock';
import { Button } from '../components/ui/Button';
import { TrendingDown, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Simulation() {
  const {
    scenarios,
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

      {/* Simulator Interactive Work Area */}
      <SimulationControls
        selectedCount={selectedInterventions.length}
        totalCount={simulationMock.available_interventions.length}
        onReset={() => applyScenario(scenarios[1] || scenarios[0])}
        simulating={simulating}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InterventionSelector
          interventions={simulationMock.available_interventions}
          selectedIds={selectedInterventions}
          onToggle={toggleIntervention}
        />

        <div className="space-y-6">
          <SimulationResults result={simulationResult} />
          <FinancialImpact result={simulationResult} />
        </div>
      </div>

      {/* Side-by-Side Scenario Comparison Matrix */}
      <ScenarioComparison
        scenarios={scenarios}
        activeId={activeScenarioId}
        onSelect={applyScenario}
      />
    </div>
  );
}
export default Simulation;
