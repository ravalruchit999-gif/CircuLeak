import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

export async function getAdminStats() {
  return apiRequest(ENDPOINTS.ADMIN_STATS, {
    method: 'GET',
  });
}

export async function getAdminFacilities() {
  return apiRequest(ENDPOINTS.ADMIN_FACILITIES, {
    method: 'GET',
  });
}

export async function getAdminUsers() {
  return apiRequest(ENDPOINTS.ADMIN_USERS, {
    method: 'GET',
  });
}

export async function getAdminEmissionFactors() {
  return apiRequest(ENDPOINTS.ADMIN_EMISSION_FACTORS, {
    method: 'GET',
  });
}

export async function getAdminUploads() {
  return apiRequest(ENDPOINTS.ADMIN_UPLOADS, {
    method: 'GET',
  });
}

export async function getAdminAuditLogs() {
  return apiRequest(ENDPOINTS.ADMIN_AUDIT_LOGS, {
    method: 'GET',
  });
}

export async function getAdminBenchmarks() {
  return apiRequest(ENDPOINTS.ADMIN_BENCHMARKS, {
    method: 'GET',
  });
}

export async function recalculateBenchmarks() {
  return apiRequest(ENDPOINTS.ADMIN_BENCHMARKS_CALCULATE, {
    method: 'POST',
  });
}
