/**
 * Circular Recommendations Mock Data (Single Source of Truth)
 */

export const recommendationsMock = {
  facility_id: 'FAC-8842',
  total_recommendations: 4,
  potential_co2_reduction_total: 3150, // kgCO2e/day
  total_investment: 650000, // ₹6,50,000
  total_annual_savings: 420000, // ₹4,20,000
  overall_payback_years: 1.55, // 650000 / 420000

  items: [
    {
      id: 'REC-01',
      title: 'Compressor Off-Hours Sequencing & Unloader Servicing',
      category: 'Operational Circularity',
      target_equipment: 'Compressor 03',
      target_process: 'Compressed Air Utility',
      why_recommended: 'Eliminates 45% off-hours energy bleed during non-production shifts (22:00-04:00) by automated pressure interlock and dual valve seating.',
      co2_reduction: 950, // kgCO2e / day
      investment: 80000, // ₹80,000
      annual_savings: 160000, // ₹1,60,000 / year
      payback_years: 0.5,
      feasibility: 'High',
      effort_level: 'Low Effort',
      impact_level: 'High Impact',
      implementation_time: '2 Weeks',
      phase: 'Immediate',
      priority_score: 96,
      engineering_specs: {
        equipment_type: 'Rotary Screw Utility Control',
        contractor_type: 'Pneumatics OEM Specialist',
        downtime_needed: '4 Hours (Weekend scheduled)',
      },
    },
    {
      id: 'REC-02',
      title: 'Furnace Flue-Gas Waste Heat Recovery (Recuperator)',
      category: 'Thermal Recovery',
      target_equipment: 'Furnace Line 2',
      target_process: 'Smelting & Primary Melt',
      why_recommended: 'Captures 420°C flue gas exhaust through heat exchanger to pre-heat scrap metal charge, saving 28% natural gas consumption.',
      co2_reduction: 1150,
      investment: 250000,
      annual_savings: 120000,
      payback_years: 2.08,
      feasibility: 'High',
      effort_level: 'Medium Effort',
      impact_level: 'High Impact',
      implementation_time: '6 Weeks',
      phase: 'Short Term',
      priority_score: 91,
      engineering_specs: {
        equipment_type: 'Metallic Radiation Recuperator',
        contractor_type: 'Thermal Engineering EPC',
        downtime_needed: '16 Hours planned maintenance shutdown',
      },
    },
    {
      id: 'REC-03',
      title: 'Closed-Loop Cooling Tower Water Recirculation & VFD',
      category: 'Water & Energy Circularity',
      target_equipment: 'Cooling Tower 01',
      target_process: 'Cooling & Auxiliary',
      why_recommended: 'Installs variable frequency drive (VFD) modulating pump speeds to actual thermal load, reducing parasitic motor draw and evaporative makeup loss.',
      co2_reduction: 450,
      investment: 120000,
      annual_savings: 60000,
      payback_years: 2.0,
      feasibility: 'High',
      effort_level: 'Low Effort',
      impact_level: 'Medium Impact',
      implementation_time: '3 Weeks',
      phase: 'Short Term',
      priority_score: 84,
      engineering_specs: {
        equipment_type: 'Inverter Grade VFD Pump Controller',
        contractor_type: 'Industrial Automation Vendor',
        downtime_needed: 'Zero (Bypass manifold enabled)',
      },
    },
    {
      id: 'REC-04',
      title: 'On-Site Rooftop Solar PV Integration (200 kWp PPA)',
      category: 'Renewable Substitution',
      target_equipment: 'Plant Rooftop Substation',
      target_process: 'Facility-Wide Base Load',
      why_recommended: 'Displaces daytime grid draw during peak tariff windows with clean solar generation under OPEX/PPA model.',
      co2_reduction: 600,
      investment: 200000,
      annual_savings: 80000,
      payback_years: 2.5,
      feasibility: 'Medium',
      effort_level: 'Medium Effort',
      impact_level: 'High Impact',
      implementation_time: '8 Weeks',
      phase: 'Medium Term',
      priority_score: 76,
      engineering_specs: {
        equipment_type: 'Tier-1 Mono PERC Solar Array',
        contractor_type: 'Solar EPC Partner',
        downtime_needed: 'Zero operational disruption',
      },
    },
  ],

  // 2x2 Priority Matrix Buckets (Backend ranked)
  priority_matrix: {
    high_impact_low_effort: [
      { id: 'REC-01', title: 'Compressor Off-Hours Sequencing', score: 96 },
      { id: 'REC-03', title: 'Closed-Loop Cooling VFD', score: 84 },
    ],
    high_impact_high_effort: [
      { id: 'REC-02', title: 'Furnace Flue-Gas Recuperator', score: 91 },
      { id: 'REC-04', title: 'On-Site Rooftop Solar PV', score: 76 },
    ],
    low_impact_low_effort: [],
    low_impact_high_effort: [],
  },

  // Phased Action Sequence
  action_plan_phases: [
    {
      phase: 'Immediate (Month 1-2)',
      interventions: ['REC-01: Compressor Off-Hours Sequencing'],
      total_capex: 80000,
      total_annual_savings: 160000,
      co2_impact: '950 kgCO₂e/day',
    },
    {
      phase: 'Short Term (Month 3-6)',
      interventions: ['REC-02: Furnace Recuperator', 'REC-03: Cooling Tower VFD'],
      total_capex: 370000,
      total_annual_savings: 180000,
      co2_impact: '1,600 kgCO₂e/day',
    },
    {
      phase: 'Medium Term (Month 6-12)',
      interventions: ['REC-04: Rooftop Solar PV'],
      total_capex: 200000,
      total_annual_savings: 80000,
      co2_impact: '600 kgCO₂e/day',
    },
  ],
};
