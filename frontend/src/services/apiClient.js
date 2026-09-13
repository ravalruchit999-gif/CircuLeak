/**
 * Centralized API Client
 * Strictly calls FastAPI backend directly.
 * Throws structured errors on failure. No fake or fallback data.
 */

import { API_CONFIG } from '../constants/api';

/**
 * Execute an API call to FastAPI backend
 * @param {string} endpoint - API relative path
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const { timeout = API_CONFIG.TIMEOUT_MS, ...fetchOptions } = options;

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
        if (Array.isArray(json.detail)) {
          parsedMessage = json.detail
            .map((d) => (d.loc ? `${d.loc[d.loc.length - 1]}: ${d.msg}` : d.msg))
            .join('; ');
        } else if (typeof json.detail === 'string') {
          parsedMessage = json.detail;
        } else {
          parsedMessage = json.message || json.error?.message || parsedMessage;
        }
      } catch {
        // use default
      }

      // Automatically evict expired/invalid tokens from localStorage on 401
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('circuleak_token');
          localStorage.removeItem('circuleak_user');
          window.dispatchEvent(new CustomEvent('circuleak:unauthorized'));
        }
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
    // Re-throw so hooks and components catch and display real empty or error states
    throw err;
  }
}
