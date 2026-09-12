/**
 * Circularity Score Mock Data (Single Source of Truth)
 */

export const circularityMock = {
  facility_id: 'FAC-8842',
  overall_score: 64, // 0-100 score
  projected_score: 83,
  score_delta: 19,
  tier: 'Transitioning Circular',

  pillars: [
    {
      id: 'material_reuse',
      name: 'Material Reuse',
      current_score: 58,
      projected_score: 78,
      weight: 20,
      description: 'Internal scrap metal re-melting ratio and runner/riser circulation efficiency.',
      key_leverage: 'Scrap pre-heating and dross recovery optimization.',
    },
    {
      id: 'waste_recovery',
      name: 'Waste Recovery',
      current_score: 72,
      projected_score: 88,
      weight: 20,
      description: 'Slag recycling in construction aggregates and dust baghouse filtration capture.',
      key_leverage: 'Flue-gas heat recovery into thermal loops.',
    },
    {
      id: 'renewable_energy',
      name: 'Renewable Energy',
      current_score: 48,
      projected_score: 75,
      weight: 20,
      description: 'On-site clean solar generation share vs fossil-intensive grid electricity.',
      key_leverage: 'Commissioning 200 kWp rooftop solar PV PPA array.',
    },
    {
      id: 'process_efficiency',
      name: 'Process Efficiency',
      current_score: 71,
      projected_score: 89,
      weight: 20,
      description: 'Specific energy consumption per batch melted and compressed air pressure stability.',
      key_leverage: 'Compressor unloader repair and VFD pump regulation.',
    },
    {
      id: 'carbon_utilization',
      name: 'Carbon Utilization',
      current_score: 60,
      projected_score: 82,
      weight: 20,
      description: 'Avoided direct emissions through closed-loop thermal and operational mitigation.',
      key_leverage: 'Total avoidance of 3,150 kgCO₂e per operating day.',
    },
  ],
};
