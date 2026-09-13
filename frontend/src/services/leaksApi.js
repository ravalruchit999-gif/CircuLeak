import { apiRequest } from './apiClient';
import { ENDPOINTS } from '../constants/api';

export async function getCarbonHotspots(facilityId) {
  const res = await apiRequest(ENDPOINTS.LEAKS_HOTSPOTS(facilityId), {
    method: 'GET',
  });
  return res;
}

export async function getLeakAnomalies(facilityId) {
  const res = await apiRequest(ENDPOINTS.LEAKS_ANOMALIES(facilityId), {
    method: 'GET',
  });

  if (res.data) {
    const raw = res.data;
    const anomalies = Array.isArray(raw.anomalies) ? raw.anomalies : [];
    const leaks = anomalies.map((a, idx) => {
      const riskScore = Math.round(a.risk_score || 0);
      const riskLevel = riskScore >= 75 ? 'Critical' : riskScore >= 50 ? 'High' : 'Moderate';
      const deviation = Math.round(a.deviation_percent || 0);

      return {
        id: a.leak_id ? `LEAK-${String(a.leak_id).padStart(2, '0')}` : `LEAK-${String(idx + 1).padStart(2, '0')}`,
        raw_id: a.leak_id || idx + 1,
        equipment: a.equipment || 'Monitored Equipment',
        process: a.process || 'Industrial Process',
        location: a.location || 'Facility Floor',
        risk_score: riskScore,
        risk_level: riskLevel,
        emission_contribution: Math.round(a.excess_emissions_kg || (a.observed_consumption ? a.observed_consumption * 0.82 : 0)),
        baseline_consumption: Math.round(a.baseline_consumption || 0),
        observed_consumption: Math.round(a.observed_consumption || 0),
        consumption_unit: a.consumption_unit || 'kWh/day',
        deviation_percent: deviation,
        abnormal_period: a.abnormal_period || 'Operating Hours',
        production_status: a.production_status === 'inactive' ? 'Inactive' : 'Active',
        reason: a.reason || `Observed consumption is ${deviation}% above baseline during operation.`,
        potential_causes: a.potential_causes || [
          'Process parameter drift or control sensor desynchronization',
          'Mechanical friction, pneumatic leak, or valve degradation',
          'Idle running during non-production shifts'
        ],
        hourly_observed_data: a.hourly_observed_data || [],
      };
    });

    const highRiskCount = leaks.filter((l) => l.risk_score >= 70).length;
    const aggregateExcess = leaks.reduce((acc, l) => acc + (l.emission_contribution || 0), 0);

    res.data = {
      ...raw,
      facility_id: raw.facility_id || facilityId,
      has_data: raw.has_data !== undefined ? raw.has_data : leaks.length > 0,
      total_leaks: leaks.length,
      high_risk_count: highRiskCount,
      aggregate_excess_emissions: aggregateExcess,
      leaks,
      hotspots_flow: raw.hotspots_flow || null,
    };
  }

  return res;
}

export async function getLeakById(leakId, facilityId) {
  // Normalize ID (e.g., "LEAK-01" -> 1)
  let numericId = leakId;
  if (typeof leakId === 'string' && leakId.startsWith('LEAK-')) {
    const parsed = parseInt(leakId.replace('LEAK-', ''), 10);
    if (!isNaN(parsed)) numericId = parsed;
  }

  try {
    const res = await apiRequest(ENDPOINTS.INCIDENT_BY_ID(numericId), {
      method: 'GET',
    });
    return res;
  } catch (err) {
    try {
      const res = await apiRequest(ENDPOINTS.LEAK_BY_ID(numericId), {
        method: 'GET',
      });
      return res;
    } catch (fallbackErr) {
      if (facilityId) {
        const allRes = await getLeakAnomalies(facilityId);
        const leaks = allRes.data?.leaks || [];
        const found = leaks.find((l) => l.id === leakId || String(l.raw_id) === String(numericId));
        if (found) {
          return { success: true, data: found, isMock: false };
        }
      }
      throw err;
    }
  }
}

export async function updateIncidentStatus(incidentId, status, note = '') {
  let numericId = incidentId;
  if (typeof incidentId === 'string' && incidentId.startsWith('LEAK-')) {
    const parsed = parseInt(incidentId.replace('LEAK-', ''), 10);
    if (!isNaN(parsed)) numericId = parsed;
  }

  const res = await apiRequest(ENDPOINTS.INCIDENT_STATUS_UPDATE(numericId), {
    method: 'PATCH',
    body: { status, note },
  });
  return res;
}

export async function getIncidentWhyAnalysis(incidentId) {
  let numericId = incidentId;
  if (typeof incidentId === 'string' && incidentId.startsWith('LEAK-')) {
    const parsed = parseInt(incidentId.replace('LEAK-', ''), 10);
    if (!isNaN(parsed)) numericId = parsed;
  }

  const res = await apiRequest(ENDPOINTS.INCIDENT_WHY(numericId), {
    method: 'GET',
  });
  return res;
}

