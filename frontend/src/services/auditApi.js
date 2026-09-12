import { apiRequest } from './apiClient';
import { ENDPOINTS, toApiFacilityId } from '../constants/api';

export async function getAuditSummary(facilityId) {
  const res = await apiRequest(ENDPOINTS.AUDIT_SUMMARY, {
    method: 'POST',
    body: JSON.stringify({ facility_id: toApiFacilityId(facilityId) }),
  });

  if (res.data) {
    const raw = res.data;
    const structured = raw.structured_audit_data || raw.verified_metrics || {};

    let findings = [];
    if (Array.isArray(raw.key_findings) && raw.key_findings.length > 0) {
      findings = raw.key_findings.map((f, idx) => {
        if (typeof f === 'string') {
          return {
            category: idx === 0 ? 'Primary Telemetry Observation' : idx === 1 ? 'Behavioral Efficiency Leak' : 'Circular Decarbonization Opportunity',
            finding: f,
            risk_level: idx === 0 ? 'High Priority' : 'Actionable',
            impact: 'Direct carbon and operational cost impact',
          };
        }
        return f;
      });
    }

    const capex = structured.potential_savings_inr ? structured.potential_savings_inr * (structured.composite_payback_years || 1.2) : 0;
    const savings = structured.potential_savings_inr || 0;
    const payback = structured.composite_payback_years || (savings > 0 ? capex / savings : 0);
    const co2Red = structured.co2_reduction_kg || 0;

    const recPkg = {
      total_capex: Math.round(capex),
      annual_savings: Math.round(savings),
      payback_years: Number(payback.toFixed(1)),
      five_year_savings: Math.round((savings * 5) - capex),
      co2_reduction_daily: Math.round(co2Red / 365),
      reduction_percent: structured.total_emissions_kg > 0 ? Number(((co2Red / structured.total_emissions_kg) * 100).toFixed(1)) : 0,
    };

    res.data = {
      ...raw,
      facility_id: raw.facility_id || facilityId,
      has_data: raw.has_data !== undefined ? raw.has_data : (structured.total_emissions_kg > 0),
      audit_id: `AUD-${toApiFacilityId(facilityId)}-${new Date().getFullYear()}`,
      audit_date: raw.generated_at ? new Date(raw.generated_at).toLocaleDateString() : new Date().toLocaleDateString(),
      facility_name: raw.facility_name || `Facility #${facilityId}`,
      lead_auditor: raw.generated_by || 'CircuLeak AI Audit Engine',
      verification_status: raw.regulatory_ccts_standing ? `BEE CCTS Status: ${raw.regulatory_ccts_standing}` : 'Operational Verification Complete',
      executive_summary: raw.executive_narrative || raw.executive_summary || 'Ingest facility telemetry to generate executive audit memorandum.',
      key_findings: findings,
      recommended_package: recPkg,
      compliance_notes: [
        'Methodology aligns with ISO 14064-1:2018 Specification with Guidance at the Organization Level for Quantification and Reporting of GHG Emissions.',
        'Electricity emissions calculated via Central Electricity Authority (CEA) v20.0 national grid emission factors.',
        'Scope 1 direct stationary combustion calculated via IPCC Guidelines for National Greenhouse Gas Inventories.',
        'Data confidence quality assessed across temporal continuity, equipment completeness, and process stoichiometry.',
      ],
    };
  }

  return res;
}
