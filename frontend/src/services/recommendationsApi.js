import { apiRequest } from './apiClient';
import { ENDPOINTS, toApiFacilityId } from '../constants/api';
import { recommendationsMock } from '../data/recommendationsMock';

function normalizeRecommendationsData(raw) {
  if (!raw) return recommendationsMock;
  if (Array.isArray(raw)) {
    const items = raw.map((item, idx) => {
      const co2 = item.co2_reduction ?? item.estimated_co2_reduction_annual_kg ?? 1000;
      const capex = item.investment ?? item.estimated_cost_inr ?? 250000;
      const savings = item.annual_savings ?? item.annual_savings_inr ?? 150000;
      const payback = item.payback_years ?? item.payback_period_years ?? (savings > 0 ? Number((capex / savings).toFixed(2)) : 1.6);
      const phase = item.phase || (payback <= 1.0 ? 'Immediate' : payback <= 2.0 ? 'Short Term' : 'Medium Term');
      const category = item.category || (item.intervention_type ? item.intervention_type.replace(/_/g, ' ') : 'Circular Efficiency');

      return {
        id: item.id || `REC-${String(idx + 1).padStart(2, '0')}`,
        title: item.title || 'Circular Engineering Intervention',
        category,
        target_equipment: item.target_equipment || 'Main Facility',
        target_process: item.target_process || 'Thermal & Auxiliary',
        why_recommended: item.why_recommended || item.description || item.match_reason || 'Identified via root-cause telemetry audit.',
        co2_reduction: Math.round(co2),
        investment: Math.round(capex),
        annual_savings: Math.round(savings),
        payback_years: payback,
        feasibility: item.feasibility || 'High',
        effort_level: item.effort_level || (payback <= 1.0 ? 'Low Effort' : 'Medium Effort'),
        impact_level: item.impact_level || 'High Impact',
        implementation_time: item.implementation_time || `${Math.round(payback * 4)} Weeks`,
        phase,
        priority_score: Math.round(item.priority_score || (item.match_score ? item.match_score * 100 : 85)),
        engineering_specs: item.engineering_specs || {
          equipment_type: item.target_equipment || 'Industrial Auxiliary',
          contractor_type: 'OEM Specialist',
          downtime_needed: 'Scheduled weekend window',
        },
      };
    });

    const totalReduction = items.reduce((sum, r) => sum + r.co2_reduction, 0);
    const totalCapex = items.reduce((sum, r) => sum + r.investment, 0);
    const totalSavings = items.reduce((sum, r) => sum + r.annual_savings, 0);
    const overallPayback = totalSavings > 0 ? Number((totalCapex / totalSavings).toFixed(2)) : 1.55;

    return {
      facility_id: 1,
      total_recommendations: items.length,
      potential_co2_reduction_total: totalReduction,
      total_investment: totalCapex,
      total_annual_savings: totalSavings,
      overall_payback_years: overallPayback,
      items,
      priority_matrix: recommendationsMock.priority_matrix,
      action_plan_phases: recommendationsMock.action_plan_phases,
    };
  }

  return {
    ...recommendationsMock,
    ...raw,
    items: raw.items || recommendationsMock.items,
    priority_matrix: raw.priority_matrix || recommendationsMock.priority_matrix,
    action_plan_phases: raw.action_plan_phases || raw.phases || recommendationsMock.action_plan_phases,
  };
}

export async function getRecommendations(facilityId = 'FAC-8842') {
  const res = await apiRequest(ENDPOINTS.RECOMMENDATIONS(facilityId), {
    method: 'GET',
    mockData: recommendationsMock,
  });
  if (res.data) {
    res.data = normalizeRecommendationsData(res.data);
  }
  return res;
}

export async function getRecommendationsByLeak(leakId) {
  const filtered = recommendationsMock.items.filter(
    (item) => item.target_equipment.toLowerCase().includes('compressor') || item.id === 'REC-01'
  );
  return apiRequest(ENDPOINTS.RECOMMENDATIONS_BY_LEAK(leakId), {
    method: 'GET',
    mockData: filtered,
  });
}

export async function getInterventionsPriority(facilityId = 'FAC-8842') {
  const res = await apiRequest(ENDPOINTS.INTERVENTIONS_PRIORITY(facilityId), {
    method: 'GET',
    mockData: {
      priority_matrix: recommendationsMock.priority_matrix,
      phases: recommendationsMock.action_plan_phases,
    },
  });

  if (res.data) {
    if (res.data.ranked_interventions && !res.data.phases) {
      res.data.priority_matrix = recommendationsMock.priority_matrix;
      res.data.phases = recommendationsMock.action_plan_phases;
    }
  }

  return res;
}
