import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import { trajectoryMock } from '../data/trajectoryMock';

export async function getTrajectory(facilityId = 'FAC-8842') {
  const res = await apiRequest(ENDPOINTS.TRAJECTORY(facilityId), {
    method: 'GET',
    mockData: trajectoryMock,
  });

  if (res.data) {
    const raw = res.data;
    const rawTrajectory = raw.trajectory || [];

    const milestones = [
      'Phase 1: Compressor sequencing + Cooling VFD',
      'Phase 2: Furnace waste heat recuperator commissioned',
      'Phase 3: Rooftop solar PV fully integrated',
      'Phase 4: Circular scrap pre-heating & induction tuning',
      'Phase 5: Net-Decarbonization threshold achieved',
    ];

    const yearlyProjection = rawTrajectory.length > 0
      ? rawTrajectory.map((pt, idx) => ({
          year: String(pt.year),
          bau_emissions: Math.round(pt.baseline_emissions),
          action_emissions: Math.round(pt.with_actions_emissions),
          avoided_daily: Math.round(pt.annual_co2_reduction ? pt.annual_co2_reduction / 365 : 1650),
          annual_savings: Math.round(pt.annual_savings),
          cumulative_savings: Math.round(pt.cumulative_savings),
          milestone: milestones[idx] || `Year ${pt.year} Optimization Milestone`,
        }))
      : trajectoryMock.yearly_projection;

    const cumulativeTonnes = raw.total_cumulative_co2_avoided_kg
      ? Math.round(raw.total_cumulative_co2_avoided_kg / 1000)
      : trajectoryMock.cumulative_co2_avoided_tonnes;

    const cumulativeSavings = raw.total_cumulative_savings_inr
      ? Math.round(raw.total_cumulative_savings_inr)
      : trajectoryMock.cumulative_financial_savings;

    res.data = {
      ...raw,
      baseline_year: raw.start_year || trajectoryMock.baseline_year,
      target_year: raw.end_year || trajectoryMock.target_year,
      cumulative_co2_avoided_tonnes: cumulativeTonnes,
      cumulative_financial_savings: cumulativeSavings,
      yearly_projection: yearlyProjection,
      roadmap_milestones: trajectoryMock.roadmap_milestones,
    };
  }

  return res;
}
