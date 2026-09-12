import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import { benchmarkMock } from '../data/benchmarkMock';

export async function getBenchmark(facilityId = 'FAC-8842') {
  return apiRequest(ENDPOINTS.BENCHMARK(facilityId), {
    method: 'GET',
    mockData: benchmarkMock.industry_benchmark,
  });
}

export async function getPeerCluster(facilityId = 'FAC-8842') {
  return apiRequest(ENDPOINTS.PEER_CLUSTER(facilityId), {
    method: 'GET',
    mockData: benchmarkMock.peer_cluster,
  });
}
