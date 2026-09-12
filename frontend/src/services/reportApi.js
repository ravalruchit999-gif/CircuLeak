import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

export async function generateReport(facilityId = 'FAC-8842', format = 'pdf') {
  return apiRequest(ENDPOINTS.REPORT_GENERATE, {
    method: 'POST',
    body: JSON.stringify({ facility_id: facilityId, format }),
    mockData: {
      success: true,
      report_url: '#download',
      format,
      generated_at: new Date().toISOString(),
      facility_id: facilityId,
      message: 'Comprehensive Industrial Decarbonization Audit Report generated successfully.',
    },
  });
}
