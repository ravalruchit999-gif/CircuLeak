import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import { facilityMock } from '../data/facilityMock';

export async function getFacility(facilityId = 'FAC-8842') {
  const res = await apiRequest(ENDPOINTS.FACILITY_BY_ID(facilityId), {
    method: 'GET',
    mockData: facilityMock,
  });

  if (res.data) {
    const raw = res.data;
    res.data = {
      ...facilityMock,
      ...raw,
      business_name: raw.business_name || facilityMock.business_name,
      facility_name: raw.business_name || facilityMock.facility_name,
      location: raw.location || facilityMock.location,
      sector: raw.sector || facilityMock.sector,
      production_type: raw.production_type || facilityMock.production_type,
      production_volume: raw.production_volume || facilityMock.production_volume,
      employees: raw.employees || facilityMock.employees,
      energy_sources: raw.energy_sources || facilityMock.energy_sources,
      equipment: raw.equipment || facilityMock.equipment,
    };
  }

  return res;
}

export async function createOrUpdateFacility(facilityData) {
  return apiRequest(ENDPOINTS.FACILITY, {
    method: 'POST',
    body: JSON.stringify(facilityData),
    mockData: { ...facilityMock, ...facilityData },
  });
}
