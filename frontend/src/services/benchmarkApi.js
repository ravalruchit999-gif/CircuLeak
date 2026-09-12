import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

export async function getBenchmark(facilityId) {
  const res = await apiRequest(ENDPOINTS.BENCHMARK(facilityId), {
    method: 'GET',
  });

  if (res.data) {
    const raw = res.data;
    res.data = {
      ...raw,
      facility_id: raw.facility_id || facilityId,
      has_data: raw.has_data !== undefined ? raw.has_data : raw.facility_intensity > 0,
      facility_intensity: raw.facility_intensity || 0,
      benchmark_average: raw.benchmark_average || 0,
      difference_percent: raw.difference_percent || 0,
      performance: raw.performance || 'Awaiting Data',
      status_summary: raw.status_summary || 'Ingest facility telemetry to compute sector benchmark variance.',
      top_performers_average: raw.best_in_class ?? raw.top_performers_average ?? 0,
    };
  }

  return res;
}

export async function getPeerCluster(facilityId) {
  const res = await apiRequest(ENDPOINTS.PEER_CLUSTER(facilityId), {
    method: 'GET',
  });

  if (res.data) {
    const raw = res.data;
    res.data = {
      ...raw,
      facility_id: raw.facility_id || facilityId,
      has_data: raw.has_data !== undefined ? raw.has_data : (raw.similar_facility_count > 0 && raw.facility_intensity > 0),
      cluster_name: raw.cluster_name || 'Sector Peer Group',
      similar_facility_count: raw.similar_facility_count || 0,
      facility_intensity: raw.facility_intensity || 0,
      cluster_average: raw.cluster_average || 0,
      gap_percent: raw.gap_percent || 0,
      cluster_min: raw.cluster_min || 0,
      cluster_max: raw.cluster_max || 0,
      cluster_description: raw.peer_characteristics?.cohort_efficiency_profile || raw.cluster_description || 'Regional industry cohort.',
    };
  }

  return res;
}
