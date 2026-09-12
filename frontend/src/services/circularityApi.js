import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import { circularityMock } from '../data/circularityMock';

export async function getCircularity(facilityId = 'FAC-8842') {
  return apiRequest(ENDPOINTS.CIRCULARITY(facilityId), {
    method: 'GET',
    mockData: circularityMock,
  });
}
