import { apiRequest } from './apiClient';
import { ENDPOINTS, toApiFacilityId } from '../constants/api';

/**
 * Inspect uploaded CSV or XLSX file headers and suggest column mappings
 * @param {File} file
 * @returns {Promise<any>}
 */
export async function inspectIndustrialDataset(file) {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest(ENDPOINTS.UPLOAD_INSPECT, {
    method: 'POST',
    body: formData,
  });
}

/**
 * Process industrial dataset with custom or verified column mapping
 * @param {File} file
 * @param {number|string} facilityId
 * @param {object} customMapping
 * @returns {Promise<any>}
 */
export async function processIndustrialDataset(file, facilityId, customMapping = null) {
  const formData = new FormData();
  formData.append('file', file);
  if (facilityId) {
    formData.append('facility_id', toApiFacilityId(facilityId));
  }
  if (customMapping && Object.keys(customMapping).length > 0) {
    formData.append('mapping', JSON.stringify(customMapping));
  }

  const res = await apiRequest(ENDPOINTS.UPLOAD_PROCESS, {
    method: 'POST',
    body: formData,
  });

  if (res.data) {
    const raw = res.data;
    res.data = {
      ...raw,
      file_name: file ? file.name : (raw.filename || 'telemetry.csv'),
      facility_id: raw.facility_id ?? facilityId,
      rows_processed: raw.rows_processed ?? raw.row_count ?? 0,
      rows_accepted: raw.rows_valid ?? raw.valid_row_count ?? 0,
      rows_rejected: raw.rows_rejected ?? raw.invalid_row_count ?? 0,
      validation_status: raw.status === 'success' || raw.status === 'completed' ? 'SUCCESS' : raw.status,
      timestamp_range: raw.timestamp_range || {
        start: raw.date_start || 'N/A',
        end: raw.date_end || 'N/A',
      },
      message: raw.message || `Successfully ingested ${raw.rows_valid || 0} telemetry rows.`,
    };
  }

  return res;
}

/**
 * Legacy wrapper for simple upload
 */
export async function uploadProcessCsv(file, facilityId) {
  return processIndustrialDataset(file, facilityId, null);
}
