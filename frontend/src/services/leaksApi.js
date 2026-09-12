import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import { leaksMock } from '../data/leaksMock';

export async function getCarbonHotspots(facilityId = 'FAC-8842') {
  return apiRequest(ENDPOINTS.LEAKS_HOTSPOTS(facilityId), {
    method: 'GET',
    mockData: leaksMock.hotspots_flow,
  });
}

export async function getLeakAnomalies(facilityId = 'FAC-8842') {
  return apiRequest(ENDPOINTS.LEAKS_ANOMALIES(facilityId), {
    method: 'GET',
    mockData: leaksMock,
  });
}

export async function getLeakById(leakId) {
  const found = leaksMock.leaks.find((l) => l.id === leakId) || leaksMock.leaks[0];
  return apiRequest(ENDPOINTS.LEAK_BY_ID(leakId), {
    method: 'GET',
    mockData: found,
  });
}
