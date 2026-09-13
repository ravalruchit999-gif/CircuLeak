/**
 * Centralized API configuration and route endpoints
 * Strictly real FastAPI backend integration - NO MOCK DATA.
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  USE_MOCK: false,
  TIMEOUT_MS: 60000,
};

export const toApiFacilityId = (id) => {
  if (typeof id === 'number') return id;
  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? 1 : parsed;
};

export const ENDPOINTS = {
  // Facilities
  FACILITY: '/facility',
  FACILITY_BY_ID: (id) => `/facility/${toApiFacilityId(id)}`,

  // Telemetry Ingestion Pipeline
  UPLOAD_INSPECT: '/upload/inspect',
  UPLOAD_CSV: '/upload/csv',
  UPLOAD_PROCESS: '/upload/process',
  UPLOAD_TEMPLATES: '/upload/templates',
  UPLOAD_TEMPLATE: (sector, format = 'xlsx') =>
    `/upload/template?format=${format}${sector ? `&sector=${encodeURIComponent(sector)}` : ''}`,

  // Emissions Analytical Suite
  EMISSIONS_SUMMARY: (id) => `/emissions/summary/${toApiFacilityId(id)}`,
  EMISSIONS_BREAKDOWN: (id) => `/emissions/breakdown/${toApiFacilityId(id)}`,
  EMISSIONS_TIMELINE: (id, interval) =>
    interval ? `/emissions/timeline/${toApiFacilityId(id)}?interval=${encodeURIComponent(interval)}` : `/emissions/timeline/${toApiFacilityId(id)}`,
  EMISSIONS_SANKEY: (id) => `/emissions/sankey/${toApiFacilityId(id)}`,

  // Leak & Incident Engine
  LEAKS_HOTSPOTS: (id) => `/leaks/hotspots/${toApiFacilityId(id)}`,
  LEAKS_ANOMALIES: (id) => `/leaks/anomalies/${toApiFacilityId(id)}`,
  LEAK_BY_ID: (id) => `/leaks/${id}`,
  INCIDENT_BY_ID: (id) => `/incidents/${id}`,
  INCIDENT_STATUS_UPDATE: (id) => `/incidents/${id}/status`,
  INCIDENT_WHY: (id) => `/incidents/${id}/why`,
  INCIDENT_RECOMMENDATIONS: (id) => `/incidents/${id}/recommendations`,
  INCIDENT_RECOMMENDATIONS_COMPARE: (id) => `/incidents/${id}/recommendations/compare`,

  // Interventions & Recommendations Knowledge Base
  INTERVENTIONS_CATALOG: '/interventions',
  INTERVENTION_BY_ID: (id) => `/interventions/${id}`,
  INTERVENTIONS_COMPARE: '/interventions/compare',
  RECOMMENDATIONS: (id) => `/recommendations/${toApiFacilityId(id)}`,
  RECOMMENDATIONS_BY_LEAK: (leakId) => `/recommendations/leak/${leakId}`,
  INTERVENTIONS_PRIORITY: (id) => `/interventions/priority/${toApiFacilityId(id)}`,

  // Simulation & Trajectory
  SIMULATION_WHAT_IF: '/simulation/what-if',
  SIMULATION_SCENARIOS: '/simulation/scenarios',
  TRAJECTORY: (id) => `/trajectory/${toApiFacilityId(id)}`,

  // Peer Benchmarking & Circularity
  BENCHMARK: (id) => `/benchmark/${toApiFacilityId(id)}`,
  PEER_CLUSTER: (id) => `/benchmark/peer-cluster/${toApiFacilityId(id)}`,
  CIRCULARITY: (id) => `/circularity/${toApiFacilityId(id)}`,
  SYMBIOSIS: (id) => `/symbiosis/${toApiFacilityId(id)}`,
  CCTS: (id, price) => price ? `/ccts/${toApiFacilityId(id)}?carbon_price_inr=${encodeURIComponent(price)}` : `/ccts/${toApiFacilityId(id)}`,
  CCTS_MONETIZE: '/ccts/monetize',

  // AI Audit Summary & Report Generation
  AUDIT_SUMMARY: '/audit/summary',
  AUDIT_SUMMARY_BY_ID: (id) => `/audit/summary/${toApiFacilityId(id)}`,
  REPORT_GENERATE: '/report/generate',

  // Authentication & Session
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_ME: '/auth/me',

  // Data Quality & Ingestion Observability
  DATA_QUALITY_OVERVIEW: '/data-quality/overview',
  DATA_QUALITY_FACILITY: (id) => `/data-quality/facility/${toApiFacilityId(id)}`,

  // Admin Governance
  ADMIN_STATS: '/admin/stats',
  ADMIN_FACILITIES: '/admin/facilities',
  ADMIN_USERS: '/admin/users',
  ADMIN_EMISSION_FACTORS: '/admin/emission-factors',
  ADMIN_BENCHMARKS: '/admin/benchmarks',
  ADMIN_BENCHMARKS_CALCULATE: '/admin/benchmarks/calculate',
  ADMIN_UPLOADS: '/admin/uploads',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
};
