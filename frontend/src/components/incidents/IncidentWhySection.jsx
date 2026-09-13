import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, FileText, Database, GitCommit, ChevronDown, ChevronUp, Activity, Scale, Sparkles } from 'lucide-react';
import { IncidentEvidenceChain } from './IncidentEvidenceChain';
import { IncidentWhatChanged } from './IncidentWhatChanged';
import { IncidentEvidenceCards } from './IncidentEvidenceCards';
import { IncidentSupportedFactors } from './IncidentSupportedFactors';
import { IncidentMultivariable } from './IncidentMultivariable';
import { IncidentMissingData } from './IncidentMissingData';
import { IncidentHypothesisFalsification } from './IncidentHypothesisFalsification';
import { IncidentRankedActions } from './IncidentRankedActions';

export function IncidentWhySection({ whyAnalysis }) {
  const [showMethodology, setShowMethodology] = useState(false);

  if (!whyAnalysis) return null;

  const {
    summary,
    why_flagged_statement,
    evidence_chain = [],
    what_changed = [],
    evidence_items = [],
    supported_contributors = [],
    not_confirmed = [],
    missing_data = [],
    what_would_change_conclusion = [],
    ranked_next_investigation = [],
    multivariable_analysis = [],
    analysis_metadata = {},
    methodology,
    scientific_distinction
  } = whyAnalysis;

  const datasetHash = analysis_metadata?.dataset_hash;
  const analysisRunId = analysis_metadata?.analysis_run_id;
  const inputCount = analysis_metadata?.input_record_count;
  const methodologyVersion = analysis_metadata?.methodology_version || '1.0.0';

  return (
    <section className="space-y-6 pt-2 border-t border-cyan-500/20">
      {/* SECTION HEADER & EXECUTIVE WHY STATEMENT */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-[#121829] via-[#0f1422] to-[#0c101c] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Tag and Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                PHASE 2 INVESTIGATION ENGINE
              </span>
              <span className="text-xs font-mono text-slate-500">
                Methodology v{methodologyVersion}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowMethodology(!showMethodology)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <span>Scientific Epistemic Distinction</span>
              {showMethodology ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
              Why Do We Believe This Happened?
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent, non-generative, auditable evidence synthesis grounded in factory SCADA telemetry.
            </p>
          </div>

          {/* Executive Why Flagged Statement Box */}
          <div className="p-4 rounded-lg bg-[#0a0d16]/90 border border-cyan-500/40 shadow-inner">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Executive Anomaly Synthesis
            </div>
            <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed font-sans">
              {why_flagged_statement || summary}
            </p>
          </div>

          {/* Epistemic Status Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-[#1e2536]">
            <div className="flex items-center gap-2 p-2 rounded bg-[#0a0d16] border border-emerald-500/20 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <div>
                <span className="text-emerald-400 font-bold">[FACT]</span>
                <span className="text-slate-400 block text-[10px]">Direct Telemetry Record</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-[#0a0d16] border border-amber-500/20 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <div>
                <span className="text-amber-400 font-bold">[DIVERGENCE]</span>
                <span className="text-slate-400 block text-[10px]">Delta vs Calibrated Baseline</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-[#0a0d16] border border-indigo-500/20 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
              <div>
                <span className="text-indigo-400 font-bold">[INTERPRETATION]</span>
                <span className="text-slate-400 block text-[10px]">Supported Mechanism</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded bg-[#0a0d16] border border-zinc-500/20 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
              <div>
                <span className="text-zinc-400 font-bold">[NOT CONFIRMED]</span>
                <span className="text-slate-400 block text-[10px]">Uninstrumented Physical State</span>
              </div>
            </div>
          </div>

          {/* Expandable Epistemic Distinction Drawer */}
          {showMethodology && (
            <div className="p-4 rounded-lg bg-[#0e121c] border border-cyan-500/30 text-xs font-mono space-y-3 animate-in fade-in duration-200">
              <div className="text-cyan-300 font-bold uppercase text-[11px]">
                Rigorous Scientific Epistemic Standard
              </div>
              <p className="text-slate-300 leading-relaxed">
                {scientific_distinction || (
                  "ANOMALY DETECTION flags unusual statistical divergence. " +
                  "EVIDENCE-BASED EXPLANATION identifies measured telemetry signals associated with the divergence. " +
                  "CAUSAL INFERENCE requires physical sensor proof (e.g. pressure/temperature transducer confirmation) " +
                  "and is explicitly not asserted when those transducers are uninstrumented."
                )}
              </p>
              <div className="text-[11px] text-slate-400 border-t border-[#1e2536] pt-2">
                <span className="text-slate-500">Auditable Methodology: </span>
                {methodology}
              </div>
            </div>
          )}

          {/* Reproducibility & Provenance Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1e2536] text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dataset Hash:</span>
              <span className="text-slate-200 font-bold">
                {datasetHash ? `${datasetHash.slice(0, 16)}...` : 'N/A'}
              </span>
            </div>

            {analysisRunId && (
              <div>
                <span className="text-slate-500">Analysis Run:</span>{' '}
                <span className="text-cyan-300">{analysisRunId}</span>
              </div>
            )}

            {inputCount !== undefined && inputCount !== null && (
              <div>
                <span className="text-slate-500">Evaluated Records:</span>{' '}
                <span className="text-white font-bold">{inputCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. DETERMINISTIC EVIDENCE CHAIN (5-Step Inductive Flow) */}
      <IncidentEvidenceChain evidenceChain={evidence_chain} />

      {/* 2. MEASURED WHAT CHANGED (Baseline Comparison Table) */}
      <IncidentWhatChanged whatChanged={what_changed} />

      {/* 3. STRUCTURED EVIDENCE SIGNALS (Composite Strength + Timestamps) */}
      <IncidentEvidenceCards evidenceItems={evidence_items} />

      {/* 4. SUPPORTED FACTORS VS EXPLICIT NOT CONFIRMED */}
      <IncidentSupportedFactors
        supportedContributors={supported_contributors}
        notConfirmed={not_confirmed}
      />

      {/* 5. MULTIVARIABLE ASSOCIATION ANALYSIS */}
      <IncidentMultivariable multivariableAnalysis={multivariable_analysis} />

      {/* 6. MISSING DATA & OBSERVABILITY LIMITS */}
      <IncidentMissingData missingData={missing_data} />

      {/* 7. HYPOTHESIS FALSIFICATION CRITERIA */}
      <IncidentHypothesisFalsification falsifications={what_would_change_conclusion} />

      {/* 8. RANKED NEXT INVESTIGATION ACTIONS */}
      <IncidentRankedActions rankedActions={ranked_next_investigation} />
    </section>
  );
}

export default IncidentWhySection;
