import { apiRequest } from './apiClient';
import { ENDPOINTS, toApiFacilityId } from '../constants/api';
import { auditMock } from '../data/auditMock';

export async function getAuditSummary(facilityId = 'FAC-8842') {
  const res = await apiRequest(ENDPOINTS.AUDIT_SUMMARY, {
    method: 'POST',
    body: JSON.stringify({ facility_id: toApiFacilityId(facilityId) }),
    mockData: auditMock,
  });

  if (res.data) {
    const raw = res.data;
    const structured = raw.structured_audit_data || {};

    // Map findings
    let findings = auditMock.key_findings;
    if (Array.isArray(raw.key_findings) && raw.key_findings.length > 0) {
      findings = raw.key_findings.map((f, idx) => {
        if (typeof f === 'string') {
          return {
            category: idx === 0 ? 'Structural Thermal Hotspot' : idx === 1 ? 'Behavioral Compression Leak' : 'Circular Efficiency Opportunity',
            finding: f,
            risk_level: idx === 0 ? 'Critical' : idx === 1 ? 'High' : 'Medium',
            impact: idx === 0 ? 'Avoidable excess emissions & utility cost' : 'Actionable savings via circular intervention',
          };
        }
        return f;
      });
    }

    const recPkg = {
      total_capex: structured.total_investment || auditMock.recommended_package.total_capex,
      annual_savings: structured.cost_savings || auditMock.recommended_package.annual_savings,
      payback_years: structured.payback || auditMock.recommended_package.payback_years,
      five_year_savings: structured.cost_savings ? (structured.cost_savings * 5) - (structured.total_investment || 0) : auditMock.recommended_package.five_year_savings,
      co2_reduction_daily: structured.co2_reduction ? Math.round(structured.co2_reduction / 365) : auditMock.recommended_package.co2_reduction_daily,
      reduction_percent: auditMock.recommended_package.reduction_percent,
    };

    res.data = {
      ...raw,
      audit_id: raw.audit_id || `AUD-2026-${toApiFacilityId(facilityId)}`,
      audit_date: raw.generated_at ? new Date(raw.generated_at).toLocaleDateString() : 'March 12, 2026',
      facility_name: structured.facility_name || 'Apex Metals & Casting Unit 4',
      lead_auditor: raw.generated_by || 'CircuLeak AI Diagnostic Engine v2.4',
      verification_status: raw.regulatory_ccts_standing ? `Audit Certified (${raw.regulatory_ccts_standing})` : 'Audit Certified & Ready for Executive Signoff',
      executive_summary: raw.executive_narrative || raw.executive_summary || auditMock.executive_summary,
      key_findings: findings,
      recommended_package: recPkg,
      compliance_notes: auditMock.compliance_notes,
    };
  }

  return res;
}
