import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

export async function getTrajectory(facilityId) {
  const res = await apiRequest(ENDPOINTS.TRAJECTORY(facilityId), {
    method: 'GET',
  });

  if (res.data) {
    const raw = res.data;
    const rawTrajectory = raw.trajectory || raw.yearly_projection || [];

    const defaultMilestones = [
      'Remediate high-risk anomaly leaks',
      'Deploy VFD retrofits and thermal insulation',
      'Recover waste heat and process condensate',
      'Integrate rooftop solar and fuel switching',
      'Net-Decarbonization threshold operationalization',
    ];

    const yearlyProjection = rawTrajectory.map((pt, idx) => ({
      year: String(pt.year),
      bau_emissions: Math.round(pt.baseline_emissions || pt.bau_emissions_kg || 0),
      action_emissions: Math.round(pt.with_actions_emissions || pt.with_interventions_kg || 0),
      avoided_daily: Math.round((pt.annual_co2_reduction || pt.annual_reduction_kg || 0) / 365),
      annual_reduction: Math.round(pt.annual_co2_reduction || pt.annual_reduction_kg || 0),
      annual_savings: Math.round(pt.annual_savings || 0),
      cumulative_savings: Math.round(pt.cumulative_savings || pt.cumulative_financial_savings || 0),
      milestone: pt.milestone || (raw.roadmap_milestones && raw.roadmap_milestones[idx]?.target) || defaultMilestones[idx] || `Year ${pt.year} Optimization`,
    }));

    const cumulativeTonnes = raw.total_cumulative_co2_avoided_kg
      ? Math.round(raw.total_cumulative_co2_avoided_kg / 1000)
      : Math.round((raw.cumulative_co2_avoided || 0) / 1000);

    const cumulativeSavings = raw.total_cumulative_savings_inr
      ? Math.round(raw.total_cumulative_savings_inr)
      : Math.round(raw.cumulative_financial_savings || 0);

    res.data = {
      ...raw,
      facility_id: raw.facility_id || facilityId,
      has_data: raw.has_data !== undefined ? raw.has_data : yearlyProjection.length > 0,
      baseline_year: raw.start_year || 2026,
      target_year: raw.end_year || 2030,
      cumulative_co2_avoided_tonnes: cumulativeTonnes,
      cumulative_financial_savings: cumulativeSavings,
      yearly_projection: yearlyProjection,
      roadmap_milestones: raw.roadmap_milestones || [],
    };
  }

  return res;
}
