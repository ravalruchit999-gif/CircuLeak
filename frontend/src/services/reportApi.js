import { apiRequest } from './apiClient';
import { ENDPOINTS, toApiFacilityId, API_CONFIG } from '../constants/api';

export async function generateReport(facilityId, format = 'pdf') {
  const numericId = toApiFacilityId(facilityId);

  const res = await apiRequest(ENDPOINTS.REPORT_GENERATE, {
    method: 'POST',
    body: JSON.stringify({ facility_id: numericId }),
  });

  if (res.data) {
    const raw = res.data;
    const backendOrigin = API_CONFIG.BASE_URL.replace(/\/api\/?$/, '');
    const downloadUrl = raw.download_url
      ? (raw.download_url.startsWith('http') ? raw.download_url : `${backendOrigin}${raw.download_url}`)
      : '#download';

    const previewUrl = raw.preview_url
      ? (raw.preview_url.startsWith('http') ? raw.preview_url : `${backendOrigin}${raw.preview_url}`)
      : (downloadUrl.includes('?') ? `${downloadUrl}&inline=true` : `${downloadUrl}?inline=true`);

    res.data = {
      ...raw,
      success: true,
      report_url: previewUrl,
      preview_url: previewUrl,
      download_url: downloadUrl,
      format: 'pdf',
      generated_at: raw.generated_at || new Date().toISOString(),
      facility_id: facilityId,
      message: `Industrial Decarbonization Audit Report (${raw.file_name || 'Audit_Report.pdf'}) generated successfully.`,
    };
  }

  return res;
}
