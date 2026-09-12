/**
 * Unified Demo Facility Profile: Apex Metals & Casting Unit 4
 */

export const facilityMock = {
  facility_id: 'FAC-8842',
  business_name: 'Apex Metals & Casting Ltd.',
  facility_name: 'Apex Casting & Precision Alloy Unit 4',
  sector: 'Alloy & Steel Fabrication',
  location: 'Vadodara Industrial Estate, Gujarat, India',
  production_type: 'Continuous Melting & Precision Die-Casting',
  production_volume: 45000, // metric tons / year
  production_volume_unit: 'metric tons / year',
  employees: 280,
  operating_hours: '24/7 (3 Shifts: 06:00-14:00, 14:00-22:00, 22:00-06:00)',
  energy_sources: [
    { name: 'Grid Electricity (HT)', share_percent: 54, annual_consumption: '14,200 MWh' },
    { name: 'Natural Gas (PNG)', share_percent: 36, annual_consumption: '1,840,000 SCM' },
    { name: 'Diesel (Backup Genset)', share_percent: 10, annual_consumption: '185,000 Liters' },
  ],
  equipment: [
    { id: 'EQ-01', name: 'Compressor 03', type: 'Rotary Screw Compressor', process: 'Compressed Air Utility', status: 'flagged_leak', installed_year: 2019 },
    { id: 'EQ-02', name: 'Furnace Line 2', type: 'Induction Melting Furnace', process: 'Smelting & Primary Melt', status: 'high_consumption', installed_year: 2017 },
    { id: 'EQ-03', name: 'Furnace Line 1', type: 'Induction Melting Furnace', process: 'Smelting & Primary Melt', status: 'optimal', installed_year: 2021 },
    { id: 'EQ-04', name: 'Annealing Oven 01', type: 'Natural Gas Annealer', process: 'Heat Treatment', status: 'moderate', installed_year: 2018 },
    { id: 'EQ-05', name: 'Cooling Tower 01', type: 'Evaporative Cooling Loop', process: 'Cooling & Recirculation', status: 'optimal', installed_year: 2020 },
    { id: 'EQ-06', name: 'Hydraulic Press 400T', type: 'Deep Draw Hydraulic Press', process: 'Forming & Machining', status: 'optimal', installed_year: 2022 },
  ],
  contact_person: 'Rajesh Nair, Lead Plant Operations Engineer',
  last_audit_date: '2026-02-15',
};
