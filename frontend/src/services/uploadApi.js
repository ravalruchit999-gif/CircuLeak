import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

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

  // When live, send multipart form data
  const formData = new FormData();
  if (file) formData.append('file', file);
  formData.append('facility_id', facilityId);

  return apiRequest(ENDPOINTS.UPLOAD_CSV, {
    method: 'POST',
    headers: {}, // let browser set multipart boundary
    body: formData,
    mockData: mockUploadResult,
  });
}
