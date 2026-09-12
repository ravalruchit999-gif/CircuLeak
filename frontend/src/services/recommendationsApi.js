import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import { recommendationsMock } from '../data/recommendationsMock';

export async function getRecommendations(facilityId = 'FAC-8842') {
  return apiRequest(ENDPOINTS.RECOMMENDATIONS(facilityId), {
    method: 'GET',
    mockData: recommendationsMock,
  });
}

export async function getRecommendationsByLeak(leakId) {
  const filtered = recommendationsMock.items.filter(
    (item) => item.target_equipment.toLowerCase().includes('compressor') || item.id === 'REC-01'
  );
  return apiRequest(ENDPOINTS.RECOMMENDATIONS_BY_LEAK(leakId), {
    method: 'GET',
    mockData: filtered,
  });
}

export async function getInterventionsPriority(facilityId = 'FAC-8842') {
  return apiRequest(ENDPOINTS.INTERVENTIONS_PRIORITY(facilityId), {
    method: 'GET',
    mockData: {
      priority_matrix: recommendationsMock.priority_matrix,
      phases: recommendationsMock.action_plan_phases,
    },
  });
}
