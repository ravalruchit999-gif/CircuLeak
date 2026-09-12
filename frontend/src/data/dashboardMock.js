/**
 * Executive Dashboard Mock Data (Single Source of Truth)
 */

export const dashboardMock = {
  facility_id: 'FAC-8842',
  facility_name: 'Apex Metals & Casting Unit 4',
  period: 'Last 30 Days Normalized',
  metrics: {
    total_emissions: 12450, // kgCO2e / day
    total_emissions_annual: 4544, // tCO2e / year
    leak_count: 7,
    high_risk_count: 3,
    potential_reduction: 3150, // kgCO2e / day (25.3%)
    potential_reduction_percent: 25.3,
    annual_savings: 420000, // ₹4,20,000
    investment_required: 650000, // ₹6,50,000
    payback_years: 1.55, // 650000 / 420000
    emission_intensity: 101, // kgCO2e / metric ton product
  },
  top_hotspots: [
    { rank: 1, equipment: 'Furnace Line 2', process: 'Smelting & Primary Melt', emissions: 4620, share_percent: 37.1, status: 'Active Anomaly' },
    { rank: 2, equipment: 'Compressor 03', process: 'Compressed Air Utility', emissions: 2480, share_percent: 19.9, status: 'Critical Leak' },
    { rank: 3, equipment: 'Furnace Line 1', process: 'Smelting & Primary Melt', emissions: 2210, share_percent: 17.8, status: 'Baseline' },
    { rank: 4, equipment: 'Annealing Oven 01', process: 'Heat Treatment', emissions: 1840, share_percent: 14.8, status: 'Moderate Waste' },
    { rank: 5, equipment: 'Backup Diesel Genset', process: 'Auxiliary Power', emissions: 1300, share_percent: 10.4, status: 'Periodic Peak' },
  ],
  anomalies_summary: {
    critical_alerts: [
      {
        id: 'LEAK-01',
        equipment: 'Compressor 03',
        type: 'Off-Hours Unloader Leak',
        deviation_percent: 45,
        period: '22:00 — 04:00 (Night Shift)',
        risk_score: 87,
        status: 'Unresolved',
      },
      {
        id: 'LEAK-02',
        equipment: 'Furnace Line 2',
        type: 'Exhaust Heat Dissipation Flaw',
        deviation_percent: 28,
        period: 'Continuous 24h',
        risk_score: 79,
        status: 'Investigating',
      },
      {
        id: 'LEAK-03',
        equipment: 'Annealing Oven 01',
        type: 'Thermal Insulation Loss',
        deviation_percent: 22,
        period: '14:00 — 18:00 Peak Demand',
        risk_score: 64,
        status: 'Scheduled',
      },
    ],
  },
  emission_sources: [
    { name: 'Grid Electricity', value: 6720, percent: 54 },
    { name: 'Natural Gas', value: 4480, percent: 36 },
    { name: 'Diesel Fuel', value: 1250, percent: 10 },
  ],
  top_recommended_action: {
    id: 'REC-01',
    title: 'Compressor Off-Hours Sequencing & Unloader Repair',
    target_equipment: 'Compressor 03',
    co2_reduction: 950, // kgCO2e / day
    annual_savings: 160000, // ₹
    investment: 80000,
    payback_years: 0.5,
    feasibility: 'Immediate / Low Effort',
  },
};
