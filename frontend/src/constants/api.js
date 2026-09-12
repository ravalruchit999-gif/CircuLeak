/**
 * API configuration and route endpoints
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  USE_MOCK: import.meta.env.VITE_USE_MOCK !== 'false',
  TIMEOUT_MS: 10000,
};

export const ENDPOINTS = {
  FACILITY: '/facility',
  FACILITY_BY_ID: (id) => `/facility/${id}`,
  UPLOAD_CSV: '/upload/csv',
  EMISSIONS_SUMMARY: (id) => `/emissions/summary/${id}`,
  EMISSIONS_BREAKDOWN: (id) => `/emissions/breakdown/${id}`,
  EMISSIONS_TIMELINE: (id) => `/emissions/timeline/${id}`,
  LEAKS_HOTSPOTS: (id) => `/leaks/hotspots/${id}`,
  LEAKS_ANOMALIES: (id) => `/leaks/anomalies/${id}`,
  LEAK_BY_ID: (id) => `/leaks/${id}`,
  RECOMMENDATIONS: (id) => `/recommendations/${id}`,
  RECOMMENDATIONS_BY_LEAK: (leakId) => `/recommendations/leak/${leakId}`,
  INTERVENTIONS_PRIORITY: (id) => `/interventions/priority/${id}`,
  SIMULATION_WHAT_IF: '/simulation/what-if',
  SIMULATION_SCENARIOS: '/simulation/scenarios',
  TRAJECTORY: (id) => `/trajectory/${id}`,
  BENCHMARK: (id) => `/benchmark/${id}`,
  PEER_CLUSTER: (id) => `/benchmark/peer-cluster/${id}`,
  CIRCULARITY: (id) => `/circularity/${id}`,
  AUDIT_SUMMARY: '/audit/summary',
  REPORT_GENERATE: '/report/generate',
};
