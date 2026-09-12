import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import { circularityMock } from '../data/circularityMock';

const PILLAR_META = {
  material_reuse: {
    name: 'Material Reuse',
    description: 'Internal scrap metal re-melting ratio and runner/riser circulation efficiency.',
    key_leverage: 'Scrap pre-heating and dross recovery optimization.',
    target_lift: 20,
  },
  waste_recovery: {
    name: 'Waste Recovery',
    description: 'Slag recycling in construction aggregates and dust baghouse filtration capture.',
    key_leverage: 'Flue-gas heat recovery into thermal loops.',
    target_lift: 16,
  },
  renewable_energy: {
    name: 'Renewable Energy',
    description: 'On-site clean solar generation share vs fossil-intensive grid electricity.',
    key_leverage: 'Commissioning rooftop solar PV array.',
    target_lift: 27,
  },
  process_efficiency: {
    name: 'Process Efficiency',
    description: 'Specific energy consumption per batch melted and compressed air pressure stability.',
    key_leverage: 'Compressor unloader repair and VFD pump regulation.',
    target_lift: 18,
  },
  carbon_utilization: {
    name: 'Carbon Utilization',
    description: 'Avoided direct emissions through closed-loop thermal and operational mitigation.',
    key_leverage: 'Total avoidance of industrial leak emissions.',
    target_lift: 22,
  },
};

export async function getCircularity(facilityId = 'FAC-8842') {
  const res = await apiRequest(ENDPOINTS.CIRCULARITY(facilityId), {
    method: 'GET',
    mockData: circularityMock,
  });

  if (res.data) {
    const raw = res.data;
    const overallScore = Math.round(raw.overall_score ?? 64);
    const projectedScore = Math.round(raw.projected_score ?? raw.projected_score_after_interventions ?? 83);
    const delta = projectedScore - overallScore;

    let pillars = raw.pillars;
    if (!pillars && raw.dimensions) {
      pillars = Object.entries(raw.dimensions).map(([dimKey, score]) => {
        const meta = PILLAR_META[dimKey] || {
          name: dimKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          description: 'Circular performance metric.',
          key_leverage: 'Operational monitoring and circular loop closure.',
          target_lift: 15,
        };
        const currentScore = Math.round(score);
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
      overall_score: overallScore,
      projected_score: projectedScore,
      score_delta: delta,
      tier: raw.tier || raw.grade || 'Transitioning Circular',
      pillars: pillars || circularityMock.pillars,
    };
  }

  return res;
}
