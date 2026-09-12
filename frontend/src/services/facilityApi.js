import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import { facilityMock } from '../data/facilityMock';

export async function getFacility(facilityId = 'FAC-8842') {
  return apiRequest(ENDPOINTS.FACILITY_BY_ID(facilityId), {
    method: 'GET',
    mockData: facilityMock,
  });
}

export async function createOrUpdateFacility(facilityData) {
  return apiRequest(ENDPOINTS.FACILITY, {
    method: 'POST',
    body: JSON.stringify(facilityData),
    mockData: { ...facilityMock, ...facilityData },
  });
}
