/**
 * Carbon Leak Points & Anomaly Mock Data (Single Source of Truth)
 */

export const leaksMock = {
  facility_id: 'FAC-8842',
  total_leaks: 7,
  high_risk_count: 3,
  aggregate_excess_emissions: 3150, // kgCO2e/day avoidable

  leaks: [
    {
      id: 'LEAK-01',
      equipment: 'Compressor 03',
      process: 'Compressed Air Utility',
      location: 'Utility Bay B',
      risk_score: 87,
      risk_level: 'Critical',
      emission_contribution: 2480, // kgCO2e/day
      baseline_consumption: 42, // kWh/day baseline idle rate
      observed_consumption: 61, // kWh/day observed
      consumption_unit: 'kWh/day',
      deviation_percent: 45,
      abnormal_period: '22:00 — 04:00',
      production_status: 'Inactive',
      reason: 'Energy consumption is 45% above expected baseline during scheduled non-production hours due to unloader valve bypass leak.',
      potential_causes: [
        'Internal unloader valve seat erosion causing continuous pressure bleed',
        'Pneumatic manifold pressure drops triggering redundant motor starts',
        'Lack of automated shutoff interlock during non-production shifts',
      ],
      hourly_observed_data: [
        { time: '00:00', observed: 61, baseline: 42, status: 'Inactive' },
        { time: '02:00', observed: 62, baseline: 42, status: 'Inactive' },
        { time: '04:00', observed: 60, baseline: 42, status: 'Inactive' },
        { time: '06:00', observed: 85, baseline: 85, status: 'Active Shift 1' },
        { time: '08:00', observed: 88, baseline: 86, status: 'Active Shift 1' },
        { time: '10:00', observed: 87, baseline: 86, status: 'Active Shift 1' },
        { time: '12:00', observed: 89, baseline: 87, status: 'Active Shift 1' },
        { time: '14:00', observed: 86, baseline: 85, status: 'Active Shift 2' },
        { time: '16:00', observed: 88, baseline: 86, status: 'Active Shift 2' },
        { time: '18:00', observed: 85, baseline: 84, status: 'Active Shift 2' },
        { time: '20:00', observed: 84, baseline: 83, status: 'Active Shift 2' },
        { time: '22:00', observed: 63, baseline: 42, status: 'Inactive' },
      ],
    },
    {
      id: 'LEAK-02',
      equipment: 'Furnace Line 2',
      process: 'Smelting & Primary Melt',
      location: 'Melt Shop Floor',
      risk_score: 79,
      risk_level: 'High',
      emission_contribution: 4620,
      baseline_consumption: 480,
      observed_consumption: 614,
      consumption_unit: 'kWh/batch',
      deviation_percent: 28,
      abnormal_period: 'Continuous 24h',
      production_status: 'Active',
      reason: 'High exhaust stack exit temperature (420°C) indicating substantial unrecovered thermal energy dissipating to atmosphere.',
      potential_causes: [
        'Absence of recuperative waste heat exchanger',
        'Degraded refractory lining in secondary melting chamber',
      ],
      hourly_observed_data: [
        { time: '00:00', observed: 610, baseline: 480, status: 'Night Shift' },
        { time: '04:00', observed: 618, baseline: 480, status: 'Night Shift' },
        { time: '08:00', observed: 622, baseline: 485, status: 'Day Shift' },
        { time: '12:00', observed: 615, baseline: 480, status: 'Day Shift' },
        { time: '16:00', observed: 612, baseline: 480, status: 'Evening Shift' },
        { time: '20:00', observed: 614, baseline: 480, status: 'Evening Shift' },
      ],
    },
    {
      id: 'LEAK-03',
      equipment: 'Annealing Oven 01',
      process: 'Heat Treatment',
      location: 'Annealing Bay',
      risk_score: 64,
      risk_level: 'Medium',
      emission_contribution: 1840,
      baseline_consumption: 320,
      observed_consumption: 390,
      consumption_unit: 'SCM/day gas',
      deviation_percent: 22,
      abnormal_period: '14:00 — 18:00',
      production_status: 'Active',
      reason: 'Flue gas oxygen sensor drift causing suboptimal air-to-fuel stoichiometric combustion ratio.',
      potential_causes: [
        'Dirty burner nozzle assembly',
        'Oxygen trim controller calibration overdue',
      ],
      hourly_observed_data: [
        { time: '08:00', observed: 325, baseline: 320, status: 'Morning Batch' },
        { time: '11:00', observed: 330, baseline: 320, status: 'Morning Batch' },
        { time: '14:00', observed: 392, baseline: 320, status: 'Afternoon Drift' },
        { time: '16:00', observed: 395, baseline: 320, status: 'Afternoon Drift' },
        { time: '18:00', observed: 388, baseline: 320, status: 'Afternoon Drift' },
        { time: '20:00', observed: 335, baseline: 320, status: 'Evening Batch' },
      ],
    },
    {
      id: 'LEAK-04',
      equipment: 'Backup Diesel Genset',
      process: 'Auxiliary Power',
      location: 'Power Yard',
      risk_score: 48,
      risk_level: 'Medium',
      emission_contribution: 1250,
      baseline_consumption: 50,
      observed_consumption: 62,
      consumption_unit: 'L/hour',
      deviation_percent: 24,
      abnormal_period: 'Grid Switchover Windows',
      production_status: 'Active',
      reason: 'Low load factor (35%) running in inefficient combustion zone during minor voltage dips.',
      potential_causes: [
        'Lack of automated peak shaving synchronization',
      ],
      hourly_observed_data: [],
    },
  ],

  // Process -> Equipment Ranked Contribution Breakdown
  hotspots_flow: [
    {
      process: 'Smelting & Primary Melt',
      total_emissions: 6830,
      equipment_breakdown: [
        { name: 'Furnace Line 2', emissions: 4620, share: 67.6, flag: 'High Loss' },
        { name: 'Furnace Line 1', emissions: 2210, share: 32.4, flag: 'Optimal' },
      ],
    },
    {
      process: 'Compressed Air Utility',
      total_emissions: 2480,
      equipment_breakdown: [
        { name: 'Compressor 03', emissions: 1620, share: 65.3, flag: 'Critical Leak' },
        { name: 'Compressor 01 & 02', emissions: 860, share: 34.7, flag: 'Nominal' },
      ],
    },
    {
      process: 'Heat Treatment',
      total_emissions: 1840,
      equipment_breakdown: [
        { name: 'Annealing Oven 01', emissions: 1840, share: 100, flag: 'Medium Waste' },
      ],
    },
  ],
};
