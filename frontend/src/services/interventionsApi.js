/**
 * Interventions and Recommendations API Client.
 * Phase 3 Evidence-Backed Decision Support Platform.
 */

import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

/**
 * Normalizes an incident ID (handles e.g. "LEAK-80", "LEAK-01", "80", 80) to a positive integer.
 * Returns null if the ID is invalid, missing, or non-positive.
 * @param {any} id
 * @returns {number|null}
 */
export function normalizeIncidentId(id) {
  if (id === undefined || id === null) return null;
  let str = String(id).trim();
  if (str.toUpperCase().startsWith('LEAK-')) {
    str = str.substring(5).trim();
  }
  const lower = str.toLowerCase();
  if (!lower || lower === 'undefined' || lower === 'null' || lower === 'nan') return null;
  const num = Number(str);
  if (!Number.isNaN(num) && Number.isInteger(num) && num > 0) {
    return num;
  }
  return null;
}

/**
 * Validate that an incident ID is a valid positive integer (or valid LEAK-XX identifier).
 * Prevents dispatching malformed network requests (e.g. /incidents/undefined/recommendations).
 * @param {any} id
 * @returns {boolean}
 */
export function isValidIncidentId(id) {
  return normalizeIncidentId(id) !== null;
}

/**
 * Fetch evidence-backed recommendations for a specific carbon incident.
 * @param {number|string} incidentId
 * @param {object} [context] Optional UserDecisionContext
 */
export async function getIncidentRecommendations(incidentId, context = {}) {
  const validId = normalizeIncidentId(incidentId);
  if (!validId) {
    return { data: null, error: { message: 'Invalid or missing incident ID.' } };
  }
  const params = new URLSearchParams();
  if (context.primary_objective) params.append('primary_objective', context.primary_objective);
  if (context.max_capex_inr) params.append('max_capex_inr', context.max_capex_inr);
  if (context.max_payback_years) params.append('max_payback_years', context.max_payback_years);
  if (context.acceptable_disruption) params.append('acceptable_disruption', context.acceptable_disruption);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const url = `${ENDPOINTS.INCIDENT_RECOMMENDATIONS(validId)}${queryString}`;

  return await apiRequest(url, {
    method: 'GET',
  });
}

/**
 * Generate/recalculate evidence-backed recommendations with full POST context.
 * @param {number|string} incidentId
 * @param {object} context UserDecisionContext payload
 */
export async function generateIncidentRecommendations(incidentId, context = {}) {
  const validId = normalizeIncidentId(incidentId);
  if (!validId) {
    return { data: null, error: { message: 'Invalid or missing incident ID.' } };
  }
  return await apiRequest(ENDPOINTS.INCIDENT_RECOMMENDATIONS(validId), {
    method: 'POST',
    body: JSON.stringify(context),
  });
}

/**
 * Perform side-by-side comparative tradeoff analysis between interventions.
 * @param {number|string} incidentId
 * @param {string[]} interventionIds
 * @param {object} [context]
 */
export async function compareIncidentRecommendations(incidentId, interventionIds, context = {}) {
  const validId = normalizeIncidentId(incidentId);
  if (!validId) {
    return { data: null, error: { message: 'Invalid or missing incident ID.' } };
  }
  return await apiRequest(ENDPOINTS.INCIDENT_RECOMMENDATIONS_COMPARE(validId), {
    method: 'POST',
    body: JSON.stringify({
      intervention_ids: interventionIds,
      decision_context: context,
    }),
  });
}

/**
 * Query the authoritative industrial decarbonization interventions catalog.
 * @param {object} [filters]
 */
export async function getInterventionsCatalog(filters = {}) {
  const params = new URLSearchParams();
  if (filters.sector) params.append('sector', filters.sector);
  if (filters.equipment) params.append('equipment', filters.equipment);
  if (filters.intervention_type) params.append('intervention_type', filters.intervention_type);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const url = `${ENDPOINTS.INTERVENTIONS_CATALOG}${queryString}`;

  return await apiRequest(url, {
    method: 'GET',
  });
}

/**
 * Fetch full engineering and reference details for a specific intervention.
 * @param {string} interventionId
 */
export async function getInterventionDetail(interventionId) {
  return await apiRequest(ENDPOINTS.INTERVENTION_BY_ID(interventionId), {
    method: 'GET',
  });
}
