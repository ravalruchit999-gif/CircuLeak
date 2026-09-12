import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

export async function loginApi(email, password) {
  // Mock response fallback if backend is offline
  const mockUser = {
    id: 1,
    email,
    full_name: email.includes('admin') ? 'Chief Sustainability Auditor' : 'Rajesh Nair',
    company_name: 'Apex Metals & Casting Ltd.',
    role: email.includes('admin') ? 'admin' : 'facility_manager',
    facility_id: 1,
  };

  return apiRequest(ENDPOINTS.AUTH_LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    mockData: {
      access_token: 'mock-jwt-token-circuleak-demo',
      token_type: 'bearer',
      user: mockUser,
    },
  });
}

export async function registerApi(userData) {
  const mockUser = {
    id: 2,
    email: userData.email,
    full_name: userData.full_name,
    company_name: userData.company_name || 'Dynamic Manufacturing Facility',
    role: userData.role || 'facility_manager',
    facility_id: 2,
  };

  return apiRequest(ENDPOINTS.AUTH_REGISTER, {
    method: 'POST',
    body: JSON.stringify(userData),
    mockData: {
      access_token: 'mock-jwt-token-circuleak-new-user',
      token_type: 'bearer',
      user: mockUser,
    },
  });
}

export async function getMeApi() {
  return apiRequest(ENDPOINTS.AUTH_ME, {
    method: 'GET',
    mockData: {
      id: 1,
      email: 'manager@apexmetals.com',
      full_name: 'Rajesh Nair',
      company_name: 'Apex Metals & Casting Ltd.',
      role: 'facility_manager',
      facility_id: 1,
    },
  });
}
