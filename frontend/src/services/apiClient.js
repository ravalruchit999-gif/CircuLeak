/**
 * Centralized API Client
 * Respects VITE_USE_MOCK setting.
 * When VITE_USE_MOCK=false, calls FastAPI backend directly.
 * If backend fails, throws structured API error.
 */

import { API_CONFIG } from '../constants/api';

// Dynamic runtime override for demo presentations
let runtimeMockOverride = null;

export function setRuntimeMockMode(enableMock) {
  runtimeMockOverride = enableMock;
}

export function isMockModeActive() {
  if (runtimeMockOverride !== null) {
    return runtimeMockOverride;
  }
  return API_CONFIG.USE_MOCK;
}

/**
 * Execute an API call or retrieve mock data
 * @param {string} endpoint - API relative path
 * @param {object} options - Fetch options (method, body, headers, mockData)
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const { mockData, timeout = API_CONFIG.TIMEOUT_MS, ...fetchOptions } = options;

  // Explicit Mock Mode Check
  if (isMockModeActive()) {
    // Return simulated network latency (150ms) for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 150));
    return {
      success: true,
      data: mockData,
      isMock: true,
    };
  }

  // Real FastAPI Backend Request
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const headers = {
    Accept: 'application/json',
    ...(fetchOptions.headers || {}),
  };

  // Only set Content-Type to application/json when not sending FormData (multipart boundary)
  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      const errorBody = await response.text();
      let parsedMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const json = JSON.parse(errorBody);
        parsedMessage = json.error?.message || json.detail || json.message || parsedMessage;
        if (json.error?.details && Array.isArray(json.error.details)) {
          parsedMessage += `: ${json.error.details.join(', ')}`;
        }
      } catch {
        // use default
      }
      const error = new Error(parsedMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data !== undefined ? data.data : data,
      isMock: false,
    };
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      const timeoutError = new Error(`Request timed out after ${timeout}ms connecting to backend (${url})`);
      timeoutError.status = 408;
      throw timeoutError;
    }
    // Re-throw so hooks/pages catch and display clear API error state
    throw err;
  }
}
