import React from 'react';
import {
  Lightbulb,
  RefreshCw,
  AlertTriangle,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';
import {
  generateIncidentRecommendations,
  compareIncidentRecommendations,
  isValidIncidentId,
  normalizeIncidentId
} from '../../services/interventionsApi';
import { RecommendationObjectiveSelector } from './RecommendationObjectiveSelector';
import { RecommendationTopCard } from './RecommendationTopCard';
import { RecommendationWhyThis } from './RecommendationWhyThis';
import { RecommendationWhyNotOthers } from './RecommendationWhyNotOthers';
import { RecommendationChallenge } from './RecommendationChallenge';
import { RecommendationVerificationChecklist } from './RecommendationVerificationChecklist';
import { RecommendationComparisonModal } from './RecommendationComparisonModal';

export function IncidentRecommendationSection({ incidentId, whyAnalysis }) {
  const [context, setContext] = React.useState({
    primary_objective: 'payback',
    max_capex_inr: null,
    max_payback_years: null,
    acceptable_disruption: 'High',
  });

  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Comparison modal state
  const [comparisonModalOpen, setComparisonModalOpen] = React.useState(false);
  const [comparisonItems, setComparisonItems] = React.useState([]);
  const [comparisonTradeoffs, setComparisonTradeoffs] = React.useState([]);
  const [comparing, setComparing] = React.useState(false);

  // Fetch / Recalculate recommendations
  const fetchRecommendations = React.useCallback(
    async (ctx) => {
      const validId = normalizeIncidentId(incidentId);
      if (!validId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await generateIncidentRecommendations(validId, ctx);
        if (res?.data) {
          setData(res.data);
        } else if (res?.error) {
          const detail = res.error.details || res.error.message || 'Recommendation evaluation could not run because the decision inputs are invalid.';
          setError(detail);
        }
      } catch (err) {
        console.error('Error evaluating recommendations:', err);
        setError(err.message || 'Network error evaluating intervention pathways.');
      } finally {
        setLoading(false);
      }
    },
    [incidentId]
  );

  React.useEffect(() => {
    fetchRecommendations(context);
  }, [fetchRecommendations, context]);

  // Comparison trigger handler
  const handleOpenComparison = async (candidateId) => {
    const validId = normalizeIncidentId(incidentId);
    if (!validId || !data?.top_recommendation) return;
    const ids = Array.from(new Set([data.top_recommendation.id, candidateId]));
    try {
      setComparing(true);
      const res = await compareIncidentRecommendations(validId, ids, context);
      if (res?.data) {
        setComparisonItems(res.data.items || []);
        setComparisonTradeoffs(res.data.tradeoff_analysis || []);
        setComparisonModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to compare interventions:', err);
    } finally {
      setComparing(false);
    }
  };

  // Guard: if incidentId is invalid or still resolving
  const validNumericId = normalizeIncidentId(incidentId);
  if (!validNumericId) {
    // If still resolving from route parameters, display loading skeleton
    if (incidentId === undefined || incidentId === null || String(incidentId).trim().toLowerCase() === 'undefined' || String(incidentId).trim() === '') {
      return (
        <div className="bg-[#121622] rounded-xl border border-[#1e2536] p-6 space-y-4 animate-pulse">
          <div className="h-6 w-72 bg-slate-800 rounded" />
          <div className="h-4 w-96 bg-slate-800/60 rounded" />
          <div className="h-64 bg-slate-800/30 rounded-xl" />
        </div>
      );
    }
    return (
      <div className="bg-[#121622] rounded-xl border border-amber-900/40 p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-5 h-5" />
          <h4 className="font-semibold text-sm">Recommendation Engine Notice</h4>
        </div>
        <p className="text-xs text-slate-300">
          Recommendation evaluation cannot be requested: Incident ID is invalid or missing.
        </p>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="bg-[#121622] rounded-xl border border-[#1e2536] p-6 space-y-4 animate-pulse">
        <div className="h-6 w-72 bg-slate-800 rounded" />
        <div className="h-4 w-96 bg-slate-800/60 rounded" />
        <div className="h-64 bg-slate-800/30 rounded-xl" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-[#121622] rounded-xl border border-rose-900/40 p-6 space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <h4 className="font-semibold text-sm">Recommendation Engine Evaluation Notice</h4>
        </div>
        <p className="text-xs text-slate-300">{error}</p>
        <button
          type="button"
          onClick={() => fetchRecommendations(context)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:text-white transition-colors"
        >
          Retry Evaluation
        </button>
      </div>
    );
  }

  const topRec = data?.top_recommendation;
  const applicableList = data?.applicable_recommendations || [];
  const conditionallyList = data?.conditionally_applicable_recommendations || [];
  const hasBoundaryCandidates = applicableList.length > 0 || conditionallyList.length > 0;

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1e2536] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Lightbulb className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Evidence-Backed Intervention Recommendation
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Phase 3 Decision Console
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Authoritative, engineering-modeled circular interventions grounded in Phase 2 telemetry findings,
            published BEE/UNIDO benchmarks, and factory constraints.
          </p>
        </div>

        {data?.dataset_hash_sha256 && (
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono bg-[#0c1018] px-2.5 py-1 rounded border border-[#1b2233]">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dataset SHA-256: {data.dataset_hash_sha256.substring(0, 12)}...</span>
          </div>
        )}
      </div>

      {/* 1. OBJECTIVE & CONSTRAINT SELECTOR */}
      <RecommendationObjectiveSelector
        context={context}
        onContextChange={setContext}
        loading={loading}
      />

      {/* 2. TOP HERO RECOMMENDATION CARD */}
      {topRec ? (
        <RecommendationTopCard
          card={topRec}
          onCompare={applicableList.length > 1 ? handleOpenComparison : null}
        />
      ) : hasBoundaryCandidates ? (
        <div className="p-8 rounded-xl bg-[#121622] border border-[#1e2536] text-center space-y-3">
          <p className="text-xs text-slate-300 font-medium">
            All {conditionallyList.length} candidate interventions exceed your current constraint filters.
          </p>
          <p className="text-[11px] text-slate-400">
            {context.max_capex_inr && context.max_capex_inr < 45000 ? (
              <span className="text-amber-400 font-medium block mb-1">
                Notice: Your budget limit (₹{context.max_capex_inr.toLocaleString('en-IN')}) is below standard factory equipment Capex (minimum catalog solution starts at ₹45,000).
              </span>
            ) : null}
            Active constraints: {context.max_capex_inr ? `Max Capex ₹${context.max_capex_inr.toLocaleString('en-IN')}` : 'No Capex limit'}
            {context.max_payback_years ? ` • Max Payback ${context.max_payback_years} yrs` : ''}
            {context.acceptable_disruption ? ` • Disruption: ${context.acceptable_disruption}` : ''}
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setContext((prev) => ({
                ...prev,
                max_capex_inr: null,
                max_payback_years: null,
                acceptable_disruption: 'High'
              }))}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
            >
              Reset Constraint Filters (Show {conditionallyList.length} Candidate Options)
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-[#121622] border border-[#1e2536] text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">
            No Catalog Interventions Match This Incident's Boundaries
          </h4>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
            The knowledge catalog does not currently contain an intervention addressing problem pattern{' '}
            <span className="text-slate-200 font-mono font-medium">"{data?.problem_summary?.problem_type || 'standby_idle_energy_loss'}"</span>{' '}
            on equipment{' '}
            <span className="text-slate-200 font-mono font-medium">"{data?.problem_summary?.affected_equipment || 'this equipment'}"</span>.
          </p>
          <p className="text-[11px] text-slate-500 max-w-lg mx-auto">
            Under Phase 3 engineering integrity rules, CircuLeak never fabricates unrelated recommendations (e.g. recommending compressor air leak fixes for steam boilers).
          </p>
        </div>
      )}

      {/* 3. CONTEXTUAL SYNTHESIS: WHY THIS FITS & WHY NOT OTHERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecommendationWhyThis points={data?.why_this_option_fits || []} />
        <RecommendationWhyNotOthers comparisons={data?.why_not_others || []} />
      </div>

      {/* 4. ADVERSARIAL REVIEW: CHALLENGE MY RECOMMENDATION */}
      {data?.challenge_my_recommendation && (
        <RecommendationChallenge challengeData={data.challenge_my_recommendation} />
      )}

      {/* 5. OPERATIONAL PLANT ENGINEER VERIFICATION CHECKLIST */}
      {data?.verification_checklist && (
        <RecommendationVerificationChecklist checklist={data.verification_checklist} />
      )}

      {/* 6. ALTERNATIVE CANDIDATE PATHWAYS (Other applicable & conditionally applicable) */}
      {(applicableList.length > 1 || conditionallyList.length > 0) && (
        <div className="bg-[#121622] rounded-xl border border-[#1e2536] p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                Alternative Candidate Interventions
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Other technically evaluated pathways addressing this process equipment.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {applicableList.length + conditionallyList.length} Evaluated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {applicableList
              .filter((c) => !topRec || c.id !== topRec.id)
              .map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-lg bg-[#0e121c] border border-[#1e2536] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {c.target_equipment}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400">
                        Score: {c.score_breakdown?.total_score != null ? c.score_breakdown.total_score : 'N/A'}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-200 leading-snug">
                      {c.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {c.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1a2233] text-xs">
                    <div className="text-[11px] text-slate-400">
                      <span>Payback: </span>
                      <span className="font-semibold text-amber-300">
                        {c.economics.payback_period_years != null ? `${c.economics.payback_period_years} yrs` : 'N/A'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenComparison(c.id)}
                      className="px-2.5 py-1 rounded text-[11px] font-medium bg-[#1e2538] text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      Compare
                    </button>
                  </div>
                </div>
              ))}

            {conditionallyList.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-lg bg-[#0e121c] border border-amber-900/30 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {c.target_equipment}
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                      Conditionally Applicable
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-200 leading-snug">
                    {c.title}
                  </h5>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {c.description}
                  </p>
                </div>

                <div className="text-[11px] text-amber-400/90 pt-2 border-t border-[#1a2233]">
                  Requires: {c.applicability.conditions_for_applicability[0] || 'Prerequisites verification'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. COMPARATIVE TRADEOFF MODAL */}
      <RecommendationComparisonModal
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        items={comparisonItems}
        tradeoffs={comparisonTradeoffs}
      />
    </section>
  );
}
