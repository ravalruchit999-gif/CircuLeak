/**
 * API configuration and route endpoints
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  USE_MOCK: import.meta.env.VITE_USE_MOCK !== 'false',
  TIMEOUT_MS: 10000,
};

export const toApiFacilityId = (id) => {
  if (typeof id === 'number') return id;
  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? 1 : parsed;
};

export const ENDPOINTS = {
  FACILITY: '/facility',
  FACILITY_BY_ID: (id) => `/facility/${toApiFacilityId(id)}`,
  UPLOAD_CSV: '/upload/csv',
  EMISSIONS_SUMMARY: (id) => `/emissions/summary/${toApiFacilityId(id)}`,
  EMISSIONS_BREAKDOWN: (id) => `/emissions/breakdown/${toApiFacilityId(id)}`,
  EMISSIONS_TIMELINE: (id) => `/emissions/timeline/${toApiFacilityId(id)}`,
  EMISSIONS_SANKEY: (id) => `/emissions/sankey/${toApiFacilityId(id)}`,
  LEAKS_HOTSPOTS: (id) => `/leaks/hotspots/${toApiFacilityId(id)}`,
  LEAKS_ANOMALIES: (id) => `/leaks/anomalies/${toApiFacilityId(id)}`,
  LEAK_BY_ID: (id) => `/leaks/${id}`,
  RECOMMENDATIONS: (id) => `/recommendations/${toApiFacilityId(id)}`,
  RECOMMENDATIONS_BY_LEAK: (leakId) => `/recommendations/leak/${leakId}`,
  INTERVENTIONS_PRIORITY: (id) => `/interventions/priority/${toApiFacilityId(id)}`,
  SIMULATION_WHAT_IF: '/simulation/what-if',
  SIMULATION_SCENARIOS: '/simulation/scenarios',
  TRAJECTORY: (id) => `/trajectory/${toApiFacilityId(id)}`,
  BENCHMARK: (id) => `/benchmark/${toApiFacilityId(id)}`,
  PEER_CLUSTER: (id) => `/benchmark/peer-cluster/${toApiFacilityId(id)}`,
  CIRCULARITY: (id) => `/circularity/${toApiFacilityId(id)}`,
  AUDIT_SUMMARY: '/audit/summary',
  REPORT_GENERATE: '/report/generate',
};
