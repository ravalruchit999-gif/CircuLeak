/**
 * AI Audit Summary & Report Mock Data (Single Source of Truth)
 */

export const auditMock = {
  facility_id: 'FAC-8842',
  audit_id: 'AUD-2026-0842',
  audit_date: 'March 12, 2026',
  facility_name: 'Apex Metals & Casting Unit 4',
  lead_auditor: 'CircuLeak Industrial Diagnostic Engine v2.4',
  verification_status: 'Audit Certified & Ready for Executive Signoff',

  executive_summary:
    'An automated carbon leak detection and circular opportunity diagnostic was conducted for Apex Metals & Casting Unit 4. Analysis of observed process data indicates total plant emissions of 12,450 kgCO₂e/day (4,544 tCO₂e/year), operating at an intensity of 101 kgCO₂e per metric ton of product (+18.8% above regional industry benchmark). Seven anomaly leak-points were detected, with three classified as high risk. Implementation of four prioritized circular interventions requires ₹6,50,000 in capital investment, delivering ₹4,20,000 in annual recurring operational savings with an aggregate payback period of 1.55 years and reducing facility emissions by 25.3% (3,150 kgCO₂e/day).',

  key_findings: [
    {
      category: 'Compressed Air System Leakage',
      finding: 'Compressor 03 exhibits continuous 61 kWh draw during inactive night shifts (22:00-04:00), representing a 45% deviation above baseline. The primary cause is an unloader valve bypass leak and lack of automated off-hours interlock.',
      risk_level: 'Critical',
      impact: 'Avoidable loss of ₹1,60,000/year and 950 kgCO₂e/day.',
    },
    {
      category: 'Flue-Gas Heat Dissipation',
      finding: 'Furnace Line 2 discharges 420°C exhaust directly to atmosphere without heat capture, accounting for 37.1% of total plant emissions.',
      risk_level: 'High',
      impact: 'Avoidable natural gas fuel expense of ₹1,20,000/year and 1,150 kgCO₂e/day.',
    },
    {
      category: 'Pumping & Water Loop Efficiency',
      finding: 'Cooling Tower 01 circulating pumps operate at fixed line speed regardless of ambient wet-bulb temperature or batch thermal load.',
      risk_level: 'Medium',
      impact: 'Avoidable auxiliary power loss of ₹60,000/year and 450 kgCO₂e/day.',
    },
  ],

  recommended_package: {
    total_capex: 650000,
    annual_savings: 420000,
    payback_years: 1.55,
    five_year_savings: 2100000,
    co2_reduction_daily: 3150,
    reduction_percent: 25.3,
  },

  compliance_notes: [
    'Aligns with ISO 50001 (Energy Management System) continual improvement standards.',
    'Qualifies for Bureau of Energy Efficiency (BEE) industrial decarbonization incentives.',
    'Provides audited documentation ready for Scope 1 & Energy-Related GHG Protocol reporting.',
  ],
};
