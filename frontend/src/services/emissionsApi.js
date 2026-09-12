import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

export async function getEmissionsSummary(facilityId) {
  return apiRequest(ENDPOINTS.EMISSIONS_SUMMARY(facilityId), {
    method: 'GET',
  });
}

export async function getEmissionsBreakdown(facilityId) {
  return apiRequest(ENDPOINTS.EMISSIONS_BREAKDOWN(facilityId), {
    method: 'GET',
  });
}

export async function getEmissionsTimeline(facilityId, interval = 'daily') {
  return apiRequest(ENDPOINTS.EMISSIONS_TIMELINE(facilityId, interval), {
    method: 'GET',
  });
}

export async function getEmissionsSankey(facilityId) {
  return apiRequest(ENDPOINTS.EMISSIONS_SANKEY(facilityId), {
    method: 'GET',
  });
}
