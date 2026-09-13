import { useState, useEffect } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { simulateWhatIf, getSimulationScenarios } from '../services/simulationApi';
import { getRecommendations } from '../services/recommendationsApi';

export function useSimulation() {
  const { currentFacilityId } = useFacilityContext();
  const [scenarios, setScenarios] = useState([]);
  const [availableInterventions, setAvailableInterventions] = useState([]);
  const [selectedInterventions, setSelectedInterventions] = useState([]);
  const [simulationResult, setSimulationResult] = useState(null);
  const [activeScenarioId, setActiveScenarioId] = useState('balanced');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);

  // Initial load: fetch recommendations and scenarios
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (!currentFacilityId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [scenRes, recsRes] = await Promise.allSettled([
          getSimulationScenarios(currentFacilityId),
          getRecommendations(currentFacilityId),
        ]);

        const scens = scenRes.status === 'fulfilled' ? (scenRes.value?.data || []) : [];
        const recs = recsRes.status === 'fulfilled' ? (recsRes.value?.data?.items || []) : [];

        if (isMounted) {
          setScenarios(scens);
          setAvailableInterventions(recs);

          const defaultSelection = scens[0]?.selected_interventions || recs.slice(0, 3).map((r) => r.id);
          setSelectedInterventions(defaultSelection);

          if (defaultSelection.length > 0) {
            const simRes = await simulateWhatIf(defaultSelection, currentFacilityId);
            setSimulationResult(simRes.data);
          } else {
            setSimulationResult({
              facility_id: currentFacilityId,
              has_data: false,
              baseline_emissions: 0,
              projected_emissions: 0,
              reduction: 0,
              reduction_percent: 0,
              investment: 0,
              annual_savings: 0,
              payback_years: 0,
              five_year_savings: 0,
              selected_count: 0,
            });
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message);
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
      if (res?.data) {
        setSimulationResult(res.data);
      }
    } catch (err) {
      console.error('Simulation calculation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const applyScenario = async (scenario) => {
    if (!scenario) return;
    setActiveScenarioId(scenario.id);
    const ids = scenario.selected_interventions || [];
    setSelectedInterventions(ids);
    setSimulating(true);
    try {
      const res = await simulateWhatIf(ids, currentFacilityId);
      if (res?.data) {
        setSimulationResult(res.data);
      }
    } catch (err) {
      console.error('Apply scenario calculation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  return {
    facilityId: currentFacilityId,
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
  };
}
