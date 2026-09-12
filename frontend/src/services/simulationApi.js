import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import { simulationMock } from '../data/simulationMock';
import { round } from '../utils/numbers';

export async function getSimulationScenarios(facilityId = 'FAC-8842') {
  return apiRequest(ENDPOINTS.SIMULATION_SCENARIOS, {
    method: 'GET',
    mockData: simulationMock.scenarios,
  });
}

export async function simulateWhatIf(interventionIds = [], facilityId = 'FAC-8842') {
  // Calculate mock simulation result based on backend contract
  const allInterventions = simulationMock.available_interventions;
  const selected = allInterventions.filter((item) => interventionIds.includes(item.id));

  const totalReduction = selected.reduce((acc, curr) => acc + curr.co2_reduction, 0);
  const totalInvestment = selected.reduce((acc, curr) => acc + curr.investment, 0);
  const totalAnnualSavings = selected.reduce((acc, curr) => acc + curr.annual_savings, 0);

  const baseline = simulationMock.baseline_emissions;
  const projected = Math.max(baseline - totalReduction, 0);
  const reductionPercent = baseline > 0 ? round((totalReduction / baseline) * 100, 1) : 0;
  const payback = totalAnnualSavings > 0 ? round(totalInvestment / totalAnnualSavings, 2) : 0;
  const fiveYearSavings = totalAnnualSavings * 5;

  const mockResult = {
    facility_id: facilityId,
    baseline_emissions: baseline,
    projected_emissions: projected,
    reduction: totalReduction,
    reduction_percent: reductionPercent,
    investment: totalInvestment,
    annual_savings: totalAnnualSavings,
    payback_years: payback,
    five_year_savings: fiveYearSavings,
    selected_count: selected.length,
  };

  return apiRequest(ENDPOINTS.SIMULATION_WHAT_IF, {
    method: 'POST',
    body: JSON.stringify({ facility_id: facilityId, intervention_ids: interventionIds }),
    mockData: mockResult,
  });
}
