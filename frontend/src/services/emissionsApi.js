import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import { emissionsMock } from '../data/emissionsMock';
import { dashboardMock } from '../data/dashboardMock';

export async function getEmissionsSummary(facilityId = 'FAC-8842') {
  return apiRequest(ENDPOINTS.EMISSIONS_SUMMARY(facilityId), {
    method: 'GET',
    mockData: dashboardMock.metrics,
  });
}

export async function getEmissionsBreakdown(facilityId = 'FAC-8842') {
  return apiRequest(ENDPOINTS.EMISSIONS_BREAKDOWN(facilityId), {
    method: 'GET',
    mockData: emissionsMock,
  });
}

export async function getEmissionsTimeline(facilityId = 'FAC-8842') {
  return apiRequest(ENDPOINTS.EMISSIONS_TIMELINE(facilityId), {
    method: 'GET',
    mockData: emissionsMock.timeline,
  });
}
