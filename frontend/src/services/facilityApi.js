import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

export async function getFacility(facilityId) {
  if (!facilityId) {
    return { success: true, data: null };
  }
  const res = await apiRequest(ENDPOINTS.FACILITY_BY_ID(facilityId), {
    method: 'GET',
  });

  if (res.data) {
    const raw = res.data;
    res.data = {
      ...raw,
      facility_name: raw.business_name || raw.facility_name || `Facility #${raw.id}`,
    };
  }

  return res;
}

export async function createOrUpdateFacility(facilityData) {
  return apiRequest(ENDPOINTS.FACILITY, {
    method: 'POST',
    body: JSON.stringify(facilityData),
  });
}
