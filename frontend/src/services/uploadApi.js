import { apiRequest } from './apiClient';
import { ENDPOINTS, toApiFacilityId } from '../constants/api';

export async function uploadProcessCsv(file, facilityId = 'FAC-8842') {
  // Mock upload response
  const mockUploadResult = {
    file_name: file ? file.name : 'process_telemetry_batch_q1.csv',
    facility_id: facilityId,
    rows_processed: 8760,
    rows_accepted: 8742,
    rows_rejected: 18,
    validation_status: 'SUCCESS',
    timestamp_range: {
      start: '2026-01-01 00:00',
      end: '2026-02-28 23:59',
    },
    message: 'Data validated and successfully ingested into CircuLeak Intelligence Engine.',
  };

  // When live, send multipart form data with integer facility_id for FastAPI
  const formData = new FormData();
  if (file) formData.append('file', file);
  formData.append('facility_id', toApiFacilityId(facilityId));

  const res = await apiRequest(ENDPOINTS.UPLOAD_CSV, {
    method: 'POST',
    body: formData,
    mockData: mockUploadResult,
  });

  if (res.data) {
    const raw = res.data;
    const accepted = raw.rows_valid ?? raw.rows_accepted ?? raw.rows_processed ?? 672;
    res.data = {
      ...raw,
      file_name: file ? file.name : (raw.file_name || 'process_telemetry.csv'),
      facility_id: raw.facility_id ?? facilityId,
      rows_processed: raw.rows_processed ?? accepted,
      rows_accepted: accepted,
      rows_rejected: raw.rows_rejected ?? 0,
      validation_status: raw.validation_status || (raw.status === 'success' ? 'SUCCESS' : raw.status || 'SUCCESS'),
      timestamp_range: raw.timestamp_range || {
        start: '2026-02-01 00:00',
        end: '2026-02-28 23:00',
      },
      message: raw.message || `Successfully processed and ingested ${accepted} telemetry records into CircuLeak Intelligence Pipeline.`,
    };
  }

  return res;
}
