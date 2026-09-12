import { apiRequest } from './apiClient';
import { ENDPOINTS, toApiFacilityId } from '../constants/api';

const REC_ID_MAP = {
  'REC-01': 'auto_idle_shutdown',
  'REC-02': 'whr_boiler_flue',
  'REC-03': 'condensate_steam_recovery',
  'REC-04': 'rooftop_solar_pv',
  'REC-05': 'fuel_switch_biomass_briquettes',
};

export async function getSimulationScenarios(facilityId) {
  const res = await apiRequest(ENDPOINTS.SIMULATION_SCENARIOS, {
    method: 'POST',
    body: JSON.stringify({ facility_id: toApiFacilityId(facilityId) }),
  });

  if (res.data && res.data.scenarios) {
    const rawList = res.data.scenarios;
    const normalized = rawList.map((sc, idx) => ({
      id: sc.id || sc.scenario_name.toLowerCase().replace(/\s+/g, '_'),
      name: sc.scenario_name || sc.name,
      subtitle: sc.focus_strategy || sc.subtitle || 'Automated scenario calculation',
      reduction: sc.emission_reduction ?? sc.reduction ?? 0,
      reduction_percent: sc.reduction_percent ?? 0,
      investment: sc.investment ?? 0,
      annual_savings: sc.annual_savings ?? 0,
      payback_years: sc.payback_years ?? 0,
      five_year_savings: (sc.annual_savings ? sc.annual_savings * 5 : 0) - (sc.investment || 0),
      selected_interventions: sc.selected_interventions || [],
      tag: idx === 0 ? 'Fastest Payback' : idx === 1 ? 'Balanced Plan' : 'Highest CO₂ Abatement',
    }));
    return { ...res, data: normalized };
  }

  return { ...res, data: [] };
}

export async function simulateWhatIf(interventionIds = [], facilityId) {
  const mappedIds = interventionIds.map((id) => REC_ID_MAP[id] || id);

  const res = await apiRequest(ENDPOINTS.SIMULATION_WHAT_IF, {
    method: 'POST',
    body: JSON.stringify({
      facility_id: toApiFacilityId(facilityId),
      intervention_ids: mappedIds,
    }),
  });

  if (res.data) {
    const raw = res.data;
    const reduction = raw.reduction ?? raw.total_reduction ?? 0;
    res.data = {
      ...raw,
      reduction,
      total_reduction: reduction,
      baseline_emissions: raw.baseline_emissions ?? 0,
      projected_emissions: raw.projected_emissions ?? 0,
      reduction_percent: raw.reduction_percent ?? 0,
      investment: raw.investment ?? 0,
      annual_savings: raw.annual_savings ?? 0,
      payback_years: raw.payback_years ?? 0,
      five_year_savings: raw.five_year_savings ?? 0,
      selected_count: interventionIds.length,
    };
  }

  return res;
}
