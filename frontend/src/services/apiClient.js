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
  const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
  const token = typeof window !== 'undefined' ? localStorage.getItem('circuleak_token') : null;
  const headers = {
    Accept: 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers || {}),
  };

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
        parsedMessage = json.detail || json.message || parsedMessage;
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
