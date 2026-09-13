import React from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wrench,
  Layers,
  ArrowRight
} from 'lucide-react';
import { RecommendationScoreBreakdown } from './RecommendationScoreBreakdown';

export function RecommendationTopCard({ card, onCompare }) {
  const [activeTab, setActiveTab] = React.useState('score'); // 'score', 'provenance', 'models', 'confidence'
  const [expanded, setExpanded] = React.useState(true);

  if (!card) return null;

  const { economics, score_breakdown, confidence, reference, applicability } = card;

  return (
    <div className="bg-[#121622] rounded-xl border border-emerald-500/40 shadow-xl overflow-hidden relative">
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-transparent border-b border-emerald-500/20 px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Top Ranked Recommended Pathway
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            ID: {card.id}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Score: {score_breakdown?.total_score != null ? score_breakdown.total_score : 'N/A'} / 100
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Title & Metadata Strip */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                {card.target_equipment}
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs text-slate-300 font-medium">
                {card.target_process}
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#1a2333] text-emerald-400 border border-emerald-800/40">
                {card.intervention_category?.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-100 tracking-tight">
              {card.title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {card.description}
            </p>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block uppercase tracking-wider">
                Confidence Rating
              </span>
              <span
                className={`inline-flex items-center gap-1 font-semibold text-xs px-2.5 py-1 rounded-md mt-0.5 ${
                  confidence?.level === 'HIGH'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                    : confidence?.level === 'MEDIUM'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {confidence?.level || 'EVALUATED'} ({confidence?.confidence_score != null ? `${Math.round(confidence.confidence_score * 100)}%` : 'N/A'})
              </span>
            </div>

            {onCompare && (
              <button
                type="button"
                onClick={() => onCompare(card.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1e2738] text-slate-200 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
              >
                <span>Compare Option</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quantified Metrics Ribbon with Rigorous Provenance Tags */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 rounded-xl bg-[#0c1018] border border-[#1c2333]">
          {/* Capex */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>Estimated Capex</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono font-semibold">
                [SCENARIO]
              </span>
            </div>
            <div className="text-lg font-bold text-slate-100">
              {economics?.capex_inr != null ? `₹${economics.capex_inr.toLocaleString('en-IN')}` : 'N/A'}
            </div>
            {economics?.capex_range && (
              <div className="text-[10px] text-slate-400">
                Range: ₹{Math.round(economics.capex_range.lower_bound / 1000)}k – ₹{Math.round(economics.capex_range.upper_bound / 1000)}k
              </div>
            )}
          </div>

          {/* Annual Savings */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>Annual Net Savings</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono font-semibold">
                [SCENARIO]
              </span>
            </div>
            <div className="text-lg font-bold text-emerald-400">
              {economics?.annual_savings_inr != null ? `₹${Math.round(economics.annual_savings_inr).toLocaleString('en-IN')}` : 'Pending Telemetry'}
            </div>
            <div className="text-[10px] text-slate-400">
              Opex: {economics?.annual_opex_inr != null ? `₹${economics.annual_opex_inr.toLocaleString('en-IN')}/yr` : 'N/A'}
            </div>
          </div>

          {/* Payback */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>Payback Period</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono font-semibold">
                [CALCULATED]
              </span>
            </div>
            <div className="text-lg font-bold text-amber-300">
              {economics?.payback_period_years != null ? `${economics.payback_period_years} Years` : 'Not Evaluable'}
            </div>
            <div className="text-[10px] text-slate-400">
              Annual ROI: {economics?.roi_pct != null ? `${economics.roi_pct}%` : 'N/A'}
            </div>
          </div>

          {/* Carbon Abated */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>Annual CO2 Abatement</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono font-semibold">
                [SCENARIO]
              </span>
            </div>
            <div className="text-lg font-bold text-teal-400">
              {economics?.annual_co2_reduction_kg != null ? `${Math.round(economics.annual_co2_reduction_kg).toLocaleString('en-IN')} kg` : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-400">
              ~{economics?.annual_co2_reduction_kg ? (economics.annual_co2_reduction_kg / 1000).toFixed(1) : 0} Metric Tons/yr
            </div>
          </div>

          {/* Marginal Abatement Cost */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>Abatement Cost (MAC)</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono font-semibold">
                [CALCULATED]
              </span>
            </div>
            <div className="text-lg font-bold text-indigo-300">
              {economics?.co2_abatement_cost_inr_per_ton != null
                ? `${economics.co2_abatement_cost_inr_per_ton > 0 ? '₹' : '-₹'}${Math.abs(economics.co2_abatement_cost_inr_per_ton)}/t`
                : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-400">
              {economics?.co2_abatement_cost_inr_per_ton != null && economics.co2_abatement_cost_inr_per_ton < 0
                ? 'Net Cost-Saving Abatement'
                : 'Net Abatement Investment'}
            </div>
          </div>
        </div>

        {/* Operational Characteristics Pill Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#1c2333] text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-500">Operational Disruption:</span>
            <span className="font-semibold text-slate-200">{card.operational_disruption}</span>
          </div>

          <span className="text-slate-600">•</span>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Wrench className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-500">Complexity:</span>
            <span className="font-semibold text-slate-200">{card.implementation_complexity}</span>
          </div>

          <span className="text-slate-600">•</span>

          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-500">Technical Risk:</span>
            <span className="font-semibold text-slate-200">{card.risk_level}</span>
          </div>

          <span className="text-slate-600">•</span>

          <div className="flex items-center gap-1.5 text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-500">Published Reference:</span>
            <span className="font-semibold text-slate-200 truncate max-w-xs">{reference?.reference_organization || 'BEE'}</span>
          </div>
        </div>

        {/* Expandable Deep-Dive Tabs */}
        <div>
          <div className="flex items-center justify-between border-b border-[#1c2333] pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setActiveTab('score'); setExpanded(true); }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'score' && expanded
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Score Decomposition
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('provenance'); setExpanded(true); }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'provenance' && expanded
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Reference Provenance [REFERENCE]
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('models'); setExpanded(true); }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'models' && expanded
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Engineering Models
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('confidence'); setExpanded(true); }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'confidence' && expanded
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Confidence & Telemetry
              </button>
            </div>

            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
            >
              <span>{expanded ? 'Collapse Details' : 'Expand Details'}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Active Tab Content */}
          {expanded && (
            <div className="pt-4">
              {activeTab === 'score' && (
                <RecommendationScoreBreakdown scoreBreakdown={score_breakdown} />
              )}

              {activeTab === 'provenance' && (
                <div className="p-4 rounded-xl bg-[#0e121c] border border-[#1e2536] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <BookOpen className="w-4 h-4" />
                    <span>Published Case-Study Provenance ({reference?.reference_type})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Reference Organization:</span>
                      <span className="text-slate-200 font-medium">{reference?.reference_organization} ({reference?.reference_year})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Document / Guide:</span>
                      <span className="text-slate-200 font-medium">{reference?.reference_title || reference?.reference_url_or_document}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Published Parameter Benchmark:</span>
                      <span className="text-emerald-400 font-semibold">{reference?.reference_parameter_range}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Architectural Principle:</span>
                      <span className="text-slate-400">External case-study parameters are labeled [REFERENCE], never MEASURED factory data.</span>
                    </div>
                  </div>
                  {reference?.reference_applicability_notes && (
                    <div className="pt-2 border-t border-[#1c2333] text-xs text-slate-300 leading-relaxed">
                      <span className="text-slate-500 font-medium block mb-1">Applicability & Engineering Notes:</span>
                      {reference.reference_applicability_notes}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'models' && (
                <div className="p-4 rounded-xl bg-[#0e121c] border border-[#1e2536] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                    <Sliders className="w-4 h-4" />
                    <span>Engineering & Economic Calculation Schemas</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded bg-[#141926] border border-[#20283b]">
                      <span className="text-slate-400 font-semibold block mb-1">Capex Model</span>
                      <span className="text-slate-300 text-[11px] block">
                        Base: {economics?.capex_inr != null ? `₹${economics.capex_inr.toLocaleString('en-IN')}` : 'N/A'} [SCENARIO]
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Includes equipment, installation labor (+15%), and piping/valves.
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-[#141926] border border-[#20283b]">
                      <span className="text-slate-400 font-semibold block mb-1">Opex Model</span>
                      <span className="text-slate-300 text-[11px] block">
                        Annual: {economics?.annual_opex_inr != null ? `₹${economics.annual_opex_inr.toLocaleString('en-IN')} / yr` : 'N/A'}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Modeled at 2-5% Capex/yr for routine maintenance & servicing.
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-[#141926] border border-[#20283b]">
                      <span className="text-slate-400 font-semibold block mb-1">Savings Model</span>
                      <span className="text-slate-300 text-[11px] block">
                        Gross: {economics?.annual_savings_inr != null ? `₹${Math.round(economics.annual_savings_inr).toLocaleString('en-IN')} / yr` : 'Pending Telemetry'}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Derived from verified incident telemetry baseline & applicable tariff.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'confidence' && (
                <div className="p-4 rounded-xl bg-[#0e121c] border border-[#1e2536] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                    <Layers className="w-4 h-4" />
                    <span>Confidence Evaluation & Sensor Prerequisites</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Confidence Drivers:</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                        {(confidence?.contributing_factors || []).map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    {confidence?.uncertainty_drivers?.length > 0 && (
                      <div className="pt-2 border-t border-[#1c2333]">
                        <span className="text-amber-400 font-medium block mb-1">Uncertainty Drivers:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                          {confidence.uncertainty_drivers.map((u, i) => (
                            <li key={i}>{u}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {confidence?.what_would_change_this && (
                      <div className="pt-2 border-t border-[#1c2333] text-[11px] text-slate-400">
                        <span className="text-slate-300 font-semibold">What would refine this estimate: </span>
                        {confidence.what_would_change_this}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
