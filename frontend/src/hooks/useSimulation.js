import { useState, useEffect } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { simulateWhatIf, getSimulationScenarios } from '../services/simulationApi';

export function useSimulation() {
  const { currentFacilityId, setLiveApiError } = useFacilityContext();
  const [scenarios, setScenarios] = useState([]);
  const [selectedInterventions, setSelectedInterventions] = useState(['REC-01', 'REC-02', 'REC-03', 'REC-04']);
  const [simulationResult, setSimulationResult] = useState(null);
  const [activeScenarioId, setActiveScenarioId] = useState('balanced');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);

  // Initial load: scenarios and default simulation
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const scenRes = await getSimulationScenarios(currentFacilityId);
        if (isMounted) setScenarios(scenRes.data);

        const simRes = await simulateWhatIf(selectedInterventions, currentFacilityId);
        if (isMounted) setSimulationResult(simRes.data);
        setLiveApiError(null);
      } catch (err) {
        if (isMounted) setError(err.message);
        setLiveApiError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [currentFacilityId]);

  const toggleIntervention = async (interventionId) => {
    const updated = selectedInterventions.includes(interventionId)
      ? selectedInterventions.filter((id) => id !== interventionId)
      : [...selectedInterventions, interventionId];

    setSelectedInterventions(updated);
    setActiveScenarioId('custom');
    setSimulating(true);
    try {
      const res = await simulateWhatIf(updated, currentFacilityId);
      setSimulationResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSimulating(false);
    }
  };

  const applyScenario = async (scenario) => {
    setActiveScenarioId(scenario.id);
    setSelectedInterventions(scenario.selected_interventions);
    setSimulating(true);
    try {
      const res = await simulateWhatIf(scenario.selected_interventions, currentFacilityId);
      setSimulationResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSimulating(false);
    }
  };

  return {
    scenarios,
    selectedInterventions,
    simulationResult,
    activeScenarioId,
    loading,
    simulating,
    error,
    toggleIntervention,
    applyScenario,
  };
}
