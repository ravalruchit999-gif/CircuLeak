/**
 * 5-Year Decarbonization Trajectory Mock Data (Single Source of Truth)
 */

export const trajectoryMock = {
  facility_id: 'FAC-8842',
  baseline_year: 2026,
  target_year: 2030,
  cumulative_co2_avoided_tonnes: 4850, // total tCO2e over 5 years
  cumulative_financial_savings: 2100000, // ₹21,00,000

  yearly_projection: [
    {
      year: '2026',
      bau_emissions: 12450,
      action_emissions: 10800,
      avoided_daily: 1650,
      annual_savings: 240000,
      cumulative_savings: 240000,
      milestone: 'Phase 1: Compressor sequencing + Cooling VFD',
    },
    {
      year: '2027',
      bau_emissions: 12650,
      action_emissions: 9300,
      avoided_daily: 3350,
      annual_savings: 420000,
      cumulative_savings: 660000,
      milestone: 'Phase 2: Furnace waste heat recuperator commissioned',
    },
    {
      year: '2028',
      bau_emissions: 12900,
      action_emissions: 8400,
      avoided_daily: 4500,
      annual_savings: 460000,
      cumulative_savings: 1120000,
      milestone: 'Phase 3: 200 kWp rooftop solar fully integrated',
    },
    {
      year: '2029',
      bau_emissions: 13150,
      action_emissions: 7600,
      avoided_daily: 5550,
      annual_savings: 480000,
      cumulative_savings: 1600000,
      milestone: 'Phase 4: Circular scrap pre-heating & induction tuning',
    },
    {
      year: '2030',
      bau_emissions: 13400,
      action_emissions: 6800,
      avoided_daily: 6600,
      annual_savings: 500000,
      cumulative_savings: 2100000,
      milestone: 'Phase 5: 49.2% Net-Decarbonization threshold achieved',
    },
  ],

  roadmap_milestones: [
    { year: '2026', title: 'Operational Anomaly Elimination', description: 'Compressor bypass repair and automated off-hours load shedding.' },
    { year: '2027', title: 'Waste Heat Recovery Integration', description: 'Metallic recuperator captures 420°C flue gas exhaust.' },
    { year: '2028', title: 'On-Site Renewable Substitution', description: '200 kWp solar PV array commissioned under OPEX PPA.' },
    { year: '2029', title: 'Circular Scrap Pre-Heating', description: 'Pre-heating scrap metal using recovered thermal exhaust loops.' },
    { year: '2030', title: 'Sub-70 Intensity Milestone', description: 'Achieve emissions intensity below 60 kgCO₂e / metric ton product.' },
  ],
};
