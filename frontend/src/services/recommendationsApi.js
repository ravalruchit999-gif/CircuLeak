import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

function normalizeRecommendationsData(raw, facilityId) {
  if (!raw) {
    return {
      facility_id: facilityId,
      has_data: false,
      total_recommendations: 0,
      potential_co2_reduction_total: 0,
      total_investment: 0,
      total_annual_savings: 0,
      overall_payback_years: 0,
      items: [],
      priority_matrix: {
        high_impact_low_effort: [],
        high_impact_high_effort: [],
        low_impact_low_effort: [],
        low_impact_high_effort: [],
      },
      action_plan_phases: [],
      phases: [],
    };
  }

  const rawList = Array.isArray(raw) ? raw : (raw.items || raw.recommendations || []);
  const items = rawList.map((item, idx) => {
    const co2 = Number(item.co2_reduction ?? item.estimated_co2_reduction_annual_kg ?? 0);
    const capex = Number(item.investment ?? item.estimated_cost_inr ?? 0);
    const savings = Number(item.annual_savings ?? item.annual_savings_inr ?? 0);
    const payback = item.payback_years ?? item.payback_period_years ?? (savings > 0 ? Number((capex / savings).toFixed(1)) : 0);
    const phase = item.phase || (payback <= 1.0 ? 'Phase 1: Immediate' : payback <= 2.5 ? 'Phase 2: Medium-Term' : 'Phase 3: Strategic');
    const category = item.category || (item.intervention_type ? item.intervention_type.replace(/_/g, ' ') : 'Process Optimization');

    const effort = item.effort_level || (payback <= 1.0 ? 'Low Effort' : payback <= 2.5 ? 'Medium Effort' : 'High Effort');
    const impact = item.impact_level || (co2 > 5000 ? 'High Impact' : 'Moderate Impact');

    return {
      id: item.id || `REC-${String(idx + 1).padStart(2, '0')}`,
      raw_id: item.recommendation_id || item.id,
      title: item.recommendation || item.title || 'Decarbonization Intervention',
      category,
      target_equipment: item.target_equipment || 'Target Asset',
      target_process: item.target_process || 'Plant Operations',
      why_recommended: item.why_recommended || item.rationale || item.description || 'Identified through automated telemetry anomaly correlation.',
      co2_reduction: Math.round(co2),
      investment: Math.round(capex),
      annual_savings: Math.round(savings),
      payback_years: payback,
      feasibility: item.feasibility || 'High',
      effort_level: effort,
      impact_level: impact,
      implementation_time: item.implementation_time || (payback <= 1.0 ? '2 - 4 Weeks' : payback <= 2.5 ? '1 - 3 Months' : '3 - 6 Months'),
      phase,
      priority_score: Math.round(item.priority_score || (item.match_score ? item.match_score * 100 : 70)),
      engineering_specs: item.engineering_specs || {
        equipment_type: item.target_equipment || 'Machinery Unit',
        contractor_type: 'Certified Industrial Energy Specialist',
        downtime_needed: 'Minimal / Planned shift turnaround',
      },
    };
  });

  const totalReduction = items.reduce((sum, r) => sum + r.co2_reduction, 0);
  const totalCapex = items.reduce((sum, r) => sum + r.investment, 0);
  const totalSavings = items.reduce((sum, r) => sum + r.annual_savings, 0);
  const overallPayback = totalSavings > 0 ? Number((totalCapex / totalSavings).toFixed(1)) : 0;

  // Dynamic priority matrix
  const matrix = {
    high_impact_low_effort: items.filter((i) => i.effort_level === 'Low Effort' && i.impact_level === 'High Impact'),
    high_impact_high_effort: items.filter((i) => i.effort_level !== 'Low Effort' && i.impact_level === 'High Impact'),
    low_impact_low_effort: items.filter((i) => i.effort_level === 'Low Effort' && i.impact_level !== 'High Impact'),
    low_impact_high_effort: items.filter((i) => i.effort_level !== 'Low Effort' && i.impact_level !== 'High Impact'),
  };

  // Dynamic action plan phases
  const p1 = items.filter((i) => i.payback_years <= 1.0);
  const p2 = items.filter((i) => i.payback_years > 1.0 && i.payback_years <= 2.5);
  const p3 = items.filter((i) => i.payback_years > 2.5);

  const phases = [];
  if (p1.length > 0) {
    phases.push({
      phase_number: 1,
      name: 'Immediate Quick Wins',
      timeline: 'Months 0 — 3',
      interventions: p1,
      total_co2_reduction: p1.reduce((s, i) => s + i.co2_reduction, 0),
      total_investment: p1.reduce((s, i) => s + i.investment, 0),
      total_annual_savings: p1.reduce((s, i) => s + i.annual_savings, 0),
    });
  }
  if (p2.length > 0) {
    phases.push({
      phase_number: 2,
      name: 'System Retrofits & Recovery',
      timeline: 'Months 3 — 9',
      interventions: p2,
      total_co2_reduction: p2.reduce((s, i) => s + i.co2_reduction, 0),
      total_investment: p2.reduce((s, i) => s + i.investment, 0),
      total_annual_savings: p2.reduce((s, i) => s + i.annual_savings, 0),
    });
  }
  if (p3.length > 0) {
    phases.push({
      phase_number: 3,
      name: 'Deep Circular Infrastructure',
      timeline: 'Months 9 — 18',
      interventions: p3,
      total_co2_reduction: p3.reduce((s, i) => s + i.co2_reduction, 0),
      total_investment: p3.reduce((s, i) => s + i.investment, 0),
      total_annual_savings: p3.reduce((s, i) => s + i.annual_savings, 0),
    });
  }

  return {
    facility_id: facilityId,
    has_data: items.length > 0,
    total_recommendations: items.length,
    potential_co2_reduction_total: totalReduction,
    total_investment: totalCapex,
    total_annual_savings: totalSavings,
    overall_payback_years: overallPayback,
    items,
    priority_matrix: matrix,
    action_plan_phases: phases,
    phases,
  };
}

export async function getRecommendations(facilityId) {
  const res = await apiRequest(ENDPOINTS.RECOMMENDATIONS(facilityId), {
    method: 'GET',
  });
  if (res.data) {
    res.data = normalizeRecommendationsData(res.data, facilityId);
  }
  return res;
}

export async function getRecommendationsByLeak(leakId) {
  return apiRequest(ENDPOINTS.RECOMMENDATIONS_BY_LEAK(leakId), {
    method: 'GET',
  });
}

export async function getInterventionsPriority(facilityId) {
  const res = await apiRequest(ENDPOINTS.INTERVENTIONS_PRIORITY(facilityId), {
    method: 'GET',
  });

  if (res.data) {
    const raw = res.data;
    const ranked = raw.ranked_interventions || [];
    const normalized = normalizeRecommendationsData(ranked, facilityId);
    res.data = {
      ...raw,
      priority_matrix: normalized.priority_matrix,
      phases: normalized.phases,
      action_plan_phases: normalized.phases,
    };
  }

  return res;
}
