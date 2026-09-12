import { apiRequest } from './apiClient';
import { ENDPOINTS, toApiFacilityId } from '../constants/api';
import { simulationMock } from '../data/simulationMock';
import { round } from '../utils/numbers';

// Map frontend display IDs to backend recommendation keys
const REC_ID_MAP = {
  'REC-01': 'auto_idle_shutdown',
  'REC-02': 'whr_boiler_flue',
  'REC-03': 'condensate_steam_recovery',
  'REC-04': 'rooftop_solar_pv',
  'REC-05': 'fuel_switch_biomass_briquettes',
};

export async function getSimulationScenarios(facilityId = 'FAC-8842') {
  const res = await apiRequest(ENDPOINTS.SIMULATION_SCENARIOS, {
    method: 'POST',
    body: JSON.stringify({ facility_id: toApiFacilityId(facilityId) }),
    mockData: simulationMock.scenarios,
  });

  if (res.data && res.data.scenarios) {
    const rawList = res.data.scenarios;
    const normalized = rawList.map((sc, idx) => ({
      id: sc.id || sc.scenario_name.toLowerCase().replace(/\s+/g, '_'),
      name: sc.scenario_name || sc.name,
      subtitle: sc.focus_strategy || sc.subtitle || 'Automated strategic scenario',
      reduction: sc.emission_reduction ?? sc.reduction ?? 1400,
      reduction_percent: sc.reduction_percent ?? 11.2,
      investment: sc.investment ?? 200000,
      annual_savings: sc.annual_savings ?? 220000,
      payback_years: sc.payback_years ?? 0.91,
      five_year_savings: (sc.annual_savings ? sc.annual_savings * 5 : 1100000) - (sc.investment || 0),
      selected_interventions: sc.selected_interventions || ['REC-01', 'REC-03'],
      tag: idx === 0 ? 'Fastest Payback' : idx === 1 ? 'Recommended Plan' : 'Highest CO₂ Abatement',
    }));
    return { ...res, data: normalized };
  }

  return res;
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

  // Map any REC-XX IDs to backend identifiers
  const mappedIds = interventionIds.map((id) => REC_ID_MAP[id] || id);
  const finalInterventionIds = mappedIds.length > 0 ? mappedIds : ['auto_idle_shutdown'];

  const res = await apiRequest(ENDPOINTS.SIMULATION_WHAT_IF, {
    method: 'POST',
    body: JSON.stringify({
      facility_id: toApiFacilityId(facilityId),
      intervention_ids: finalInterventionIds,
    }),
    mockData: mockResult,
  });

  if (res.data) {
    const raw = res.data;
    const reduction = raw.reduction ?? raw.total_reduction ?? totalReduction;
    res.data = {
      ...raw,
      reduction,
      total_reduction: reduction,
      baseline_emissions: raw.baseline_emissions ?? baseline,
      projected_emissions: raw.projected_emissions ?? projected,
      reduction_percent: raw.reduction_percent ?? reductionPercent,
      investment: raw.investment ?? totalInvestment,
      annual_savings: raw.annual_savings ?? totalAnnualSavings,
      payback_years: raw.payback_years ?? payback,
      five_year_savings: raw.five_year_savings ?? fiveYearSavings,
    };
  }

  return res;
}
