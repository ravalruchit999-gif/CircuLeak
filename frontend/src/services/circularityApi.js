import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

const PILLAR_META = {
  material_reuse: {
    name: 'Material Reuse',
    description: 'Internal scrap metal and production material recycling efficiency.',
    key_leverage: 'Scrap pre-heating and feedstock recovery optimization.',
    target_lift: 15,
  },
  waste_recovery: {
    name: 'Waste Recovery',
    description: 'Flue-gas waste heat and steam condensate recirculation loop performance.',
    key_leverage: 'Heat exchanger installation and steam trap maintenance.',
    target_lift: 16,
  },
  renewable_energy: {
    name: 'Renewable Energy',
    description: 'On-site clean energy substitution share vs fossil grid power.',
    key_leverage: 'Solar PV rooftop arrays and biomass fuel substitution.',
    target_lift: 20,
  },
  process_efficiency: {
    name: 'Process Efficiency',
    description: 'Specific energy consumption per output unit and anomaly containment.',
    key_leverage: 'VFD motor regulation and compressor leak elimination.',
    target_lift: 14,
  },
  carbon_utilization: {
    name: 'Carbon Utilization',
    description: 'Direct emission mitigation and secondary carbon footprint reduction.',
    key_leverage: 'Closed-loop thermal integration and fuel switching.',
    target_lift: 18,
  },
};

export async function getCircularity(facilityId) {
  const res = await apiRequest(ENDPOINTS.CIRCULARITY(facilityId), {
    method: 'GET',
  });

  if (res.data) {
    const raw = res.data;
    const overallScore = Math.round(raw.overall_score || 0);
    const projectedScore = Math.round(raw.projected_score || raw.projected_score_after_interventions || overallScore);
    const delta = Math.max(0, projectedScore - overallScore);

    let pillars = [];
    if (raw.dimensions && typeof raw.dimensions === 'object') {
      pillars = Object.entries(raw.dimensions).map(([dimKey, score]) => {
        const meta = PILLAR_META[dimKey] || {
          name: dimKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          description: 'Circular performance metric.',
          key_leverage: 'Operational monitoring and circular loop closure.',
          target_lift: 15,
        };
        const currentScore = Math.round(score || 0);
        const projScore = Math.min(100, currentScore + meta.target_lift);
        return {
          id: dimKey,
          name: meta.name,
          current_score: currentScore,
          projected_score: projScore,
          weight: 20,
          description: meta.description,
          key_leverage: meta.key_leverage,
        };
      });
    }

    res.data = {
      ...raw,
      facility_id: raw.facility_id || facilityId,
      has_data: raw.has_data !== undefined ? raw.has_data : overallScore > 0,
      overall_score: overallScore,
      projected_score: projectedScore,
      score_delta: delta,
      tier: raw.rating || raw.grade || (overallScore >= 80 ? 'Advanced Circular' : overallScore >= 60 ? 'Progressive Circular' : 'Linear Operations'),
      pillars: (raw.pillars && raw.pillars.length > 0) ? raw.pillars : pillars,
      dimension_benchmarks: raw.dimension_benchmarks || {},
      key_insights: raw.key_insights || [],
      missing_inputs: raw.missing_inputs || [],
      symbiosis_summary: raw.symbiosis_summary || null,
    };
  }

  return res;
}
