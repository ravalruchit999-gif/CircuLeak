import { apiRequest } from './apiClient';
import { ENDPOINTS, toApiFacilityId, API_CONFIG } from '../constants/api';

export async function generateReport(facilityId = 'FAC-8842', format = 'pdf') {
  const numericId = toApiFacilityId(facilityId);

  const mockData = {
    success: true,
    report_url: '#download',
    format,
    generated_at: new Date().toISOString(),
    facility_id: facilityId,
    message: 'Comprehensive Industrial Decarbonization Audit Report generated successfully.',
  };

  const res = await apiRequest(ENDPOINTS.REPORT_GENERATE, {
    method: 'POST',
    body: JSON.stringify({ facility_id: numericId }),
    mockData,
  });

  if (res.data) {
    const raw = res.data;
    const downloadUrl = raw.download_url
      ? (raw.download_url.startsWith('http') ? raw.download_url : `http://127.0.0.1:8000${raw.download_url}`)
      : '#download';

    res.data = {
      ...raw,
      success: true,
      report_url: downloadUrl,
      download_url: downloadUrl,
      format: 'pdf',
      generated_at: raw.generated_at || new Date().toISOString(),
      facility_id: facilityId,
      message: `Industrial Decarbonization Audit Report (${raw.file_name || 'Apex_Metals_Audit.pdf'}) generated successfully.`,
    };
  }

  return res;
}
