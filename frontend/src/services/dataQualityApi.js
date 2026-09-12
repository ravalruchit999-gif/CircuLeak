import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

export async function getDataQualityOverview() {
  return apiRequest(ENDPOINTS.DATA_QUALITY_OVERVIEW, {
    method: 'GET',
  });
}

export async function getDataQualityFacility(facilityId) {
  return apiRequest(ENDPOINTS.DATA_QUALITY_FACILITY(facilityId), {
    method: 'GET',
  });
}
