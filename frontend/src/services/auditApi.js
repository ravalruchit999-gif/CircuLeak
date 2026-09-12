import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import { auditMock } from '../data/auditMock';

export async function getAuditSummary(facilityId = 'FAC-8842') {
  return apiRequest(ENDPOINTS.AUDIT_SUMMARY, {
    method: 'POST',
    body: JSON.stringify({ facility_id: facilityId }),
    mockData: auditMock,
  });
}
