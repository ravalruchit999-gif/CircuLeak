import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle, ShieldX, Database } from 'lucide-react';
import { useLeaks } from '../hooks/useLeaks';
import { Button } from '../components/ui/Button';

// Phase 1 Carbon Incident Detailed Modular Sections
import { IncidentHeader } from '../components/incidents/IncidentHeader';
import { IncidentWhatHappened } from '../components/incidents/IncidentWhatHappened';
import { IncidentImpact } from '../components/incidents/IncidentImpact';
import { IncidentTimeline } from '../components/incidents/IncidentTimeline';
import { IncidentEvidence } from '../components/incidents/IncidentEvidence';
import { IncidentDataQuality } from '../components/incidents/IncidentDataQuality';
import { IncidentDetectionLineage } from '../components/incidents/IncidentDetectionLineage';
import { IncidentNextSteps } from '../components/incidents/IncidentNextSteps';
import { IncidentWhySection } from '../components/incidents/IncidentWhySection';
import { IncidentRecommendationSection } from '../components/incidents/IncidentRecommendationSection';
import { getIncidentWhyAnalysis } from '../services/leaksApi';

export function LeakDetails() {
  const { id } = useParams();
  const { selectedLeak, loading, error, refetch, mutateStatus, mutationLoading } = useLeaks(id);
  const [whyAnalysisData, setWhyAnalysisData] = React.useState(null);
  const [whyLoading, setWhyLoading] = React.useState(false);

  React.useEffect(() => {
    if (selectedLeak?.why_analysis) {
      setWhyAnalysisData(selectedLeak.why_analysis);
    } else if (id) {
      setWhyLoading(true);
      getIncidentWhyAnalysis(id)
        .then((res) => {
          if (res?.data) {
            setWhyAnalysisData(res.data);
          }
        })
        .catch((err) => {
          console.error('Failed to load incident why analysis:', err);
        })
        .finally(() => {
          setWhyLoading(false);
        });
    }
  }, [selectedLeak, id]);

  // Status mutation handler
  const handleStatusChange = async (newStatus, note) => {
    try {
      await mutateStatus(newStatus, note);
    } catch (err) {
      console.error('Failed to update incident status:', err);
    }
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-36 bg-[#121622] rounded-xl border border-[#1e2536] p-6 flex flex-col justify-between">
          <div className="h-7 w-64 bg-slate-800 rounded mb-2" />
          <div className="h-4 w-96 bg-slate-800/60 rounded" />
          <div className="h-8 w-48 bg-slate-800/40 rounded mt-2" />
        </div>

        {/* Impact Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-[#121622] rounded-lg border border-[#1e2536]" />
          <div className="h-28 bg-[#121622] rounded-lg border border-[#1e2536]" />
          <div className="h-28 bg-[#121622] rounded-lg border border-[#1e2536]" />
        </div>

        {/* Timeline Skeleton */}
        <div className="h-64 bg-[#121622] rounded-xl border border-[#1e2536]" />

        {/* Evidence Skeleton */}
        <div className="h-48 bg-[#121622] rounded-xl border border-[#1e2536]" />
      </div>
    );
  }

  // Error State Handling (Multi-tenant 403, Missing 404, Network error)
  if (error || !selectedLeak) {
    const isForbidden = error && (error.includes('403') || error.toLowerCase().includes('unauthorized'));
    const isNotFound = error && (error.includes('404') || error.toLowerCase().includes('not found'));

    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="p-8 rounded-xl bg-[#121622] border border-[#1e2536] text-center shadow-lg">
          {isForbidden ? (
            <ShieldX className="w-12 h-12 text-red-400 mx-auto mb-4" />
          ) : isNotFound ? (
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          ) : (
            <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          )}

          <h2 className="text-lg font-bold font-mono text-white mb-2">
            {isForbidden
              ? 'ACCESS FORBIDDEN (MULTI-TENANT ISOLATION)'
              : isNotFound
              ? `CARBON INCIDENT #${id} NOT FOUND`
              : 'UNABLE TO LOAD CARBON INCIDENT'}
          </h2>

          <p className="text-xs text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
            {isForbidden
              ? 'This carbon incident belongs to another facility tenant or organization. Cross-facility access is blocked by security policy.'
              : error || 'The requested incident record does not exist in the active facility database.'}
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link to="/leaks">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back to Incident Registry
              </Button>
            </Link>
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={refetch}>
              Retry Query
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback normalization for clean backwards-compatibility
  const incidentMeta = selectedLeak.incident || {
    id: selectedLeak.id || id,
    status: selectedLeak.status || 'detected',
    severity: selectedLeak.severity || (selectedLeak.risk_score >= 80 ? 'Critical' : selectedLeak.risk_score >= 60 ? 'High' : 'Medium'),
    detected_at: selectedLeak.detected_at,
    start_time: selectedLeak.abnormal_period,
    end_time: null,
    facility_id: selectedLeak.facility_id,
    facility_name: selectedLeak.location || 'Facility Floor',
    equipment: selectedLeak.equipment || 'Monitored Machine',
    process_area: selectedLeak.process || 'Operating Area',
    metric: 'Electricity Consumption',
    detection_method: 'Historical/operational anomaly detection (Isolation Forest)',
    model_name: 'IsolationForest',
    model_version: '1.0.0',
    analysis_run_id: selectedLeak.analysis_run_id,
    dataset_hash_sha256: null,
  };

  const observedMeta = selectedLeak.observed || {
    metric_name: 'Electricity Consumption',
    value: selectedLeak.observed_consumption,
    unit: selectedLeak.consumption_unit || 'kWh',
  };

  const baselineMeta = selectedLeak.baseline || {
    metric_name: 'Expected Baseline',
    value: selectedLeak.baseline_consumption,
    unit: selectedLeak.consumption_unit || 'kWh',
    methodology: 'Historical Median Active Baseline',
    reference_description: 'Calculated from active operational cycles.',
  };

  const deviationMeta = selectedLeak.deviation || {
    percent: selectedLeak.deviation_percent,
    absolute_difference:
      selectedLeak.observed_consumption && selectedLeak.baseline_consumption
        ? Math.abs(selectedLeak.observed_consumption - selectedLeak.baseline_consumption)
        : 0,
    direction: 'excess',
  };

  const impactMeta = selectedLeak.impact || {
    carbon_impact_kg: selectedLeak.emission_contribution,
    energy_impact_kwh:
      selectedLeak.observed_consumption && selectedLeak.baseline_consumption
        ? Math.max(0, selectedLeak.observed_consumption - selectedLeak.baseline_consumption)
        : null,
    financial_impact_inr: null,
    financial_status: 'Not available from current data',
    carbon_calculation_method: 'IPCC Tier 1 Direct Multiplication',
    emission_factor_provenance: null,
  };

  const timelineData = selectedLeak.timeline || selectedLeak.hourly_observed_data || [];
  const evidenceList = selectedLeak.evidence || [];
  const contributingFactors = selectedLeak.possible_contributing_factors || selectedLeak.potential_causes || [];
  const dataQuality = selectedLeak.data_quality || null;
  const confidenceMeta = selectedLeak.confidence || null;
  const nextStepsList = selectedLeak.next_investigation || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* SECTION A — Incident Header */}
      <IncidentHeader
        incident={incidentMeta}
        onStatusChange={handleStatusChange}
        mutationLoading={mutationLoading}
      />

      {/* SECTION B & E — What Happened? and Baseline Comparison */}
      <IncidentWhatHappened
        incident={incidentMeta}
        observed={observedMeta}
        baseline={baselineMeta}
        deviation={deviationMeta}
        reason={selectedLeak.reason}
      />

      {/* SECTION C — Quantified Impact */}
      <IncidentImpact impact={impactMeta} />

      {/* SECTION D — Incident Dynamic Timeline */}
      <IncidentTimeline
        timeline={timelineData}
        baselineValue={baselineMeta?.value}
      />

      {/* PHASE 2 — Evidence-Based 'Why?' Investigation Console */}
      {whyAnalysisData && (
        <IncidentWhySection whyAnalysis={whyAnalysisData} />
      )}

      {/* PHASE 3 — Evidence-Backed Intervention Recommendation Console */}
      <IncidentRecommendationSection
        incidentId={selectedLeak?.raw_id || selectedLeak?.leak_id || id}
        whyAnalysis={whyAnalysisData}
      />

      {/* SECTION F & G — Evidence Signals & Contributing Factors */}
      <IncidentEvidence
        evidence={evidenceList}
        contributingFactors={contributingFactors}
      />

      {/* SECTION H — Data Quality & Telemetry Observability */}
      {dataQuality && <IncidentDataQuality dataQuality={dataQuality} />}

      {/* SECTION I — Detection Methodology, Lineage & Confidence */}
      <IncidentDetectionLineage
        incident={incidentMeta}
        confidence={confidenceMeta}
      />

      {/* SECTION J — Recommended Next Investigation & Source Data Link */}
      <IncidentNextSteps
        nextSteps={nextStepsList}
        incidentId={incidentMeta.id}
      />
    </div>
  );
}

export default LeakDetails;
