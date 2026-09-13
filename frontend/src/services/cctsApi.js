import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

/**
 * Fetch facility BEE CCTS compliance status, baseline intensity, and CCC valuation.
 * @param {string|number} facilityId
 * @param {number} [carbonPrice]
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export async function getCCTSStatus(facilityId, carbonPrice = 1850) {
  return await apiRequest(ENDPOINTS.CCTS(facilityId, carbonPrice), {
    method: 'GET',
  });
}

/**
 * Calculate monetization impact and accelerated payback for custom abatement scenario.
 * @param {object} payload
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export async function monetizeAbatement(payload) {
  return await apiRequest(ENDPOINTS.CCTS_MONETIZE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
