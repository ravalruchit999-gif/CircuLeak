import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import { trajectoryMock } from '../data/trajectoryMock';

export async function getTrajectory(facilityId = 'FAC-8842') {
  return apiRequest(ENDPOINTS.TRAJECTORY(facilityId), {
    method: 'GET',
    mockData: trajectoryMock,
  });
}
