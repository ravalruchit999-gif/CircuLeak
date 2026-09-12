import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

export async function getAdminStats() {
  return apiRequest(ENDPOINTS.ADMIN_STATS, {
    method: 'GET',
    mockData: {
      total_facilities: 2,
      total_users: 3,
      total_telemetry_rows: 672,
      total_leaks_flagged: 1,
      system_health: 'Optimal',
      active_database: 'PostgreSQL 17',
      ccts_standards_version: 'BEE-India-2025.2',
    },
  });
}

export async function getAdminFacilities() {
  return apiRequest(ENDPOINTS.ADMIN_FACILITIES, {
    method: 'GET',
    mockData: [
      {
        id: 1,
        business_name: 'Apex Metals & Casting Unit 4',
        sector: 'Metals & Heavy Alloys',
        location: 'Vadodara Industrial Estate, Gujarat',
        production_volume: 45000,
        employees: 280,
        telemetry_rows: 672,
        leaks_detected: 1,
        has_data: true,
        owner_name: 'Rajesh Nair',
        owner_email: 'manager@apexmetals.com',
        created_at: '2026-09-12',
      },
      {
        id: 2,
        business_name: 'Precision Casting Works',
        sector: 'Alloy & Steel Fabrication',
        location: 'Industrial Corridor, India',
        production_volume: 25000,
        employees: 120,
        telemetry_rows: 0,
        leaks_detected: 0,
        has_data: false,
        owner_name: 'Rohit Sharma',
        owner_email: 'rohit@precisioncast.com',
        created_at: '2026-09-12',
      },
    ],
  });
}

export async function getAdminUsers() {
  return apiRequest(ENDPOINTS.ADMIN_USERS, {
    method: 'GET',
    mockData: [
      {
        id: 1,
        email: 'admin@circuleak.com',
        full_name: 'Chief Sustainability Auditor',
        company_name: 'CircuLeak Platform Administration',
        role: 'admin',
        facility_id: 1,
        facility_name: 'Apex Metals & Casting Unit 4',
        created_at: '2026-09-12 09:30',
      },
      {
        id: 2,
        email: 'manager@apexmetals.com',
        full_name: 'Rajesh Nair',
        company_name: 'Apex Metals & Casting Ltd.',
        role: 'facility_manager',
        facility_id: 1,
        facility_name: 'Apex Metals & Casting Unit 4',
        created_at: '2026-09-12 09:35',
      },
    ],
  });
}

export async function getAdminEmissionFactors() {
  return apiRequest(ENDPOINTS.ADMIN_EMISSION_FACTORS, {
    method: 'GET',
    mockData: [
      { id: 1, source_type: 'grid_electricity', factor_value: 0.82, unit: 'kgCO2e/kWh', region: 'India National Grid (CEA 2024)', source_reference: 'Central Electricity Authority' },
      { id: 2, source_type: 'natural_gas', factor_value: 2.02, unit: 'kgCO2e/SCM', region: 'Industrial PNG', source_reference: 'IPCC Tier 2 Guidelines' },
      { id: 3, source_type: 'diesel', factor_value: 2.68, unit: 'kgCO2e/L', region: 'HSD Generator Fuel', source_reference: 'MoEFCC India Baseline' },
      { id: 4, source_type: 'coal', factor_value: 2.42, unit: 'kgCO2e/kg', region: 'Indian Non-Coking Coal', source_reference: 'BEE Energy Audit Manual' },
      { id: 5, source_type: 'lpg', factor_value: 2.98, unit: 'kgCO2e/kg', region: 'Commercial LPG', source_reference: 'GHG Protocol Stationary' },
    ],
  });
}
