/**
 * What-If Simulation Mock Data (Single Source of Truth)
 * Strictly matches backend fields:
 * baseline_emissions, projected_emissions, reduction, reduction_percent,
 * investment, annual_savings, payback_years, five_year_savings
 */

export const simulationMock = {
  facility_id: 'FAC-8842',
  baseline_emissions: 12450, // kgCO2e / day

  // Pre-configured Scenarios
  scenarios: [
    {
      id: 'cost_saver',
      name: 'Cost Saver',
      subtitle: 'Rapid ROI & Low Capital Interventions',
      selected_interventions: ['REC-01', 'REC-03'],
      baseline_emissions: 12450,
      projected_emissions: 11050,
      reduction: 1400,
      reduction_percent: 11.2,
      investment: 200000,
      annual_savings: 220000,
      payback_years: 0.91,
      five_year_savings: 1100000,
      tag: 'Fastest Payback',
    },
    {
      id: 'balanced',
      name: 'Balanced Strategy',
      subtitle: 'Optimal Balance of Abatement & Financial Return',
      selected_interventions: ['REC-01', 'REC-02', 'REC-03', 'REC-04'],
      baseline_emissions: 12450,
      projected_emissions: 9300,
      reduction: 3150,
      reduction_percent: 25.3,
      investment: 650000,
      annual_savings: 420000,
      payback_years: 1.55,
      five_year_savings: 2100000,
      tag: 'Recommended Plan',
    },
    {
      id: 'max_decarbonization',
      name: 'Maximum Decarbonization',
      subtitle: 'Aggressive Net-Zero Acceleration',
      selected_interventions: ['REC-01', 'REC-02', 'REC-03', 'REC-04', 'REC-05'],
      baseline_emissions: 12450,
      projected_emissions: 7650,
      reduction: 4800,
      reduction_percent: 38.6,
      investment: 1150000,
      annual_savings: 580000,
      payback_years: 1.98,
      five_year_savings: 2900000,
      tag: 'Highest CO₂ Abatement',
    },
  ],

  // Available Interventions for Custom Simulation Toggle
  available_interventions: [
    {
      id: 'REC-01',
      title: 'Compressor Off-Hours Sequencing',
      target: 'Compressor 03',
      co2_reduction: 950,
      investment: 80000,
      annual_savings: 160000,
      payback_years: 0.5,
      defaultSelected: true,
    },
    {
      id: 'REC-02',
      title: 'Furnace Waste Heat Recovery (Recuperator)',
      target: 'Furnace Line 2',
      co2_reduction: 1150,
      investment: 250000,
      annual_savings: 120000,
      payback_years: 2.08,
      defaultSelected: true,
    },
    {
      id: 'REC-03',
      title: 'Cooling Water Loop Recirculation & VFD',
      target: 'Cooling Tower 01',
      co2_reduction: 450,
      investment: 120000,
      annual_savings: 60000,
      payback_years: 2.0,
      defaultSelected: true,
    },
    {
      id: 'REC-04',
      title: 'On-Site Rooftop Solar PV PPA',
      target: 'Plant Rooftop',
      co2_reduction: 600,
      investment: 200000,
      annual_savings: 80000,
      payback_years: 2.5,
      defaultSelected: true,
    },
  ],
};
