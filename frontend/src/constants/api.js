/**
 * Centralized API configuration and route endpoints
 * Strictly real FastAPI backend integration - NO MOCK DATA.
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  USE_MOCK: false,
  TIMEOUT_MS: 15000,
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

  // Emissions Analytical Suite
  EMISSIONS_SUMMARY: (id) => `/emissions/summary/${toApiFacilityId(id)}`,
  EMISSIONS_BREAKDOWN: (id) => `/emissions/breakdown/${toApiFacilityId(id)}`,
  EMISSIONS_TIMELINE: (id) => `/emissions/timeline/${toApiFacilityId(id)}`,
  EMISSIONS_SANKEY: (id) => `/emissions/sankey/${toApiFacilityId(id)}`,

  // Leak & Anomaly Engine
  LEAKS_HOTSPOTS: (id) => `/leaks/hotspots/${toApiFacilityId(id)}`,
  LEAKS_ANOMALIES: (id) => `/leaks/anomalies/${toApiFacilityId(id)}`,
  LEAK_BY_ID: (id) => `/leaks/${id}`,

  // Interventions & Recommendations
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
