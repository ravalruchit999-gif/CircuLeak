/**
 * Emissions Intelligence Mock Data
 */

export const emissionsMock = {
  facility_id: 'FAC-8842',
  total_emissions_daily: 12450, // kgCO2e
  total_emissions_annual: 4544, // tCO2e
  emission_intensity: 101, // kgCO2e / metric ton product
  production_volume_daily: 123.3, // metric tons / day
  
  // Sources
  by_source: [
    { source: 'Grid Electricity', category: 'Energy-Related', emissions_kg: 6720, share_percent: 54.0, emission_factor: '0.82 kgCO2e/kWh' },
    { source: 'Natural Gas (PNG)', category: 'Direct Fuel', emissions_kg: 4480, share_percent: 36.0, emission_factor: '2.04 kgCO2e/SCM' },
    { source: 'Diesel (Genset)', category: 'Direct Fuel', emissions_kg: 1250, share_percent: 10.0, emission_factor: '2.68 kgCO2e/Liter' },
  ],

  // Processes
  by_process: [
    { process: 'Smelting & Primary Melt', emissions_kg: 6830, share_percent: 54.9, primary_energy: 'Electricity + Gas' },
    { process: 'Compressed Air Utility', emissions_kg: 2480, share_percent: 19.9, primary_energy: 'Grid Electricity' },
    { process: 'Heat Treatment (Annealing)', emissions_kg: 1840, share_percent: 14.8, primary_energy: 'Natural Gas' },
    { process: 'Forming, Machining & Auxiliary', emissions_kg: 1300, share_percent: 10.4, primary_energy: 'Diesel & Electricity' },
  ],

  // Equipment
  by_equipment: [
    { equipment: 'Furnace Line 2', process: 'Smelting', emissions_kg: 4620, intensity: 37.5 },
    { equipment: 'Compressor 03', process: 'Compressed Air', emissions_kg: 2480, intensity: 20.1 },
    { equipment: 'Furnace Line 1', process: 'Smelting', emissions_kg: 2210, intensity: 17.9 },
    { equipment: 'Annealing Oven 01', process: 'Heat Treatment', emissions_kg: 1840, intensity: 14.9 },
    { equipment: 'Hydraulic Press 400T', process: 'Forming', emissions_kg: 720, intensity: 5.8 },
    { equipment: 'Auxiliary Genset', process: 'Backup Power', emissions_kg: 580, intensity: 4.7 },
  ],

  // 30-Day Timeline with baseline reference
  timeline: [
    { day: 'Day 1', emissions: 12200, baseline: 12000, production: 122 },
    { day: 'Day 5', emissions: 12400, baseline: 12000, production: 124 },
    { day: 'Day 10', emissions: 13800, baseline: 12000, production: 121, flag: 'Spike' },
    { day: 'Day 15', emissions: 12600, baseline: 12000, production: 125 },
    { day: 'Day 20', emissions: 13950, baseline: 12000, production: 120, flag: 'Off-hours leak' },
    { day: 'Day 25', emissions: 12300, baseline: 12000, production: 123 },
    { day: 'Day 30', emissions: 12450, baseline: 12000, production: 123.3 },
  ],
};
