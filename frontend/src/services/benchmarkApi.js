import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import { benchmarkMock } from '../data/benchmarkMock';

export async function getBenchmark(facilityId = 'FAC-8842') {
  const res = await apiRequest(ENDPOINTS.BENCHMARK(facilityId), {
    method: 'GET',
    mockData: benchmarkMock.industry_benchmark,
  });

  if (res.data) {
    const raw = res.data;
    res.data = {
      ...raw,
      facility_intensity: raw.facility_intensity ?? 101,
      benchmark_average: raw.benchmark_average ?? 85,
      difference_percent: raw.difference_percent ?? 18.8,
      performance: raw.performance || 'Above Sector Average',
      status_summary: raw.status_summary || `Facility intensity is ${raw.difference_percent > 0 ? '+' : ''}${raw.difference_percent}% relative to the sector benchmark.`,
      top_performers_average: raw.best_in_class ?? raw.top_performers_average ?? 68,
    };
  }

  return res;
}

export async function getPeerCluster(facilityId = 'FAC-8842') {
  const res = await apiRequest(ENDPOINTS.PEER_CLUSTER(facilityId), {
    method: 'GET',
    mockData: benchmarkMock.peer_cluster,
  });

  if (res.data) {
    const raw = res.data;
    res.data = {
      ...raw,
      cluster_name: raw.cluster_name || 'Cluster 2: Medium-Heavy Precision Casting',
      similar_facility_count: raw.similar_facility_count || 24,
      facility_intensity: raw.facility_intensity ?? 101,
      cluster_average: raw.cluster_average ?? 88,
      gap_percent: raw.gap_percent ?? 14.8,
      cluster_min: raw.cluster_min ?? 71,
      cluster_max: raw.cluster_max ?? 128,
      cluster_description: raw.peer_characteristics?.cohort_efficiency_profile || raw.cluster_description || 'Comparative group of 24 induction melting and casting plants operating in western industrial zones.',
    };
  }

  return res;
}
