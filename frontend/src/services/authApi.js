import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

export async function loginApi(email, password) {
  return apiRequest(ENDPOINTS.AUTH_LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerApi(userData) {
  return apiRequest(ENDPOINTS.AUTH_REGISTER, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function getMeApi() {
  return apiRequest(ENDPOINTS.AUTH_ME, {
    method: 'GET',
  });
}
