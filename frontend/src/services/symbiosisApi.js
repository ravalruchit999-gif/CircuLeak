import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

/**
 * Fetch industrial symbiosis by-product streams and circular off-taker matches.
 * @param {string|number} facilityId
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export async function getSymbiosis(facilityId) {
  return await apiRequest(ENDPOINTS.SYMBIOSIS(facilityId), {
    method: 'GET',
  });
}

/**
 * Register a new by-product stream for circular sale/off-take.
 * @param {string|number} facilityId
 * @param {object} payload
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export async function addSymbiosisStream(facilityId, payload) {
  return await apiRequest(`${ENDPOINTS.SYMBIOSIS(facilityId)}/stream`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a user-registered by-product stream.
 * @param {string|number} facilityId
 * @param {number|string} streamId
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export async function deleteSymbiosisStream(facilityId, streamId) {
  return await apiRequest(`${ENDPOINTS.SYMBIOSIS(facilityId)}/stream/${streamId}`, {
    method: 'DELETE',
  });
}
