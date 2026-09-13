import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, AlertCircle, Cpu, Activity, Lightbulb, Info } from 'lucide-react';

const STEP_ICONS = {
  1: Activity,
  2: Cpu,
  3: AlertCircle,
  4: CheckCircle2,
  5: Lightbulb
};

const STEP_TYPE_BADGES = {
  fact: {
    label: 'OBSERVED FACT',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400'
  },
  baseline_divergence: {
    label: 'BASELINE DIVERGENCE',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400'
  },
  equipment_localization: {
    label: 'EQUIPMENT LOCALIZATION',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400'
  },
  supported_interpretation: {
    label: 'SUPPORTED INTERPRETATION',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400'
  }
};

export function IncidentEvidenceChain({ evidenceChain = [] }) {
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

  if (!evidenceChain || evidenceChain.length === 0) return null;

  const activeStep = evidenceChain[selectedStepIndex] || evidenceChain[0];
  const activeBadge = STEP_TYPE_BADGES[activeStep.type] || STEP_TYPE_BADGES.fact;

  return (
    <div className="p-6 rounded-xl bg-[#121622] border border-[#1e2536] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-base font-bold font-mono text-white tracking-wider uppercase">
              Deterministic Evidence Chain
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            5-step inductive argument linking raw transducer readings to supported operational interpretation.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <span>Click any step to inspect</span>
        </div>
      </div>

      {/* Interactive Step Sequence Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        {evidenceChain.map((step, idx) => {
          const isSelected = selectedStepIndex === idx;
          const Icon = STEP_ICONS[step.step] || Activity;
          const badge = STEP_TYPE_BADGES[step.type] || STEP_TYPE_BADGES.fact;

          return (
            <button
              key={step.step}
              type="button"
              onClick={() => setSelectedStepIndex(idx)}
              className={`p-3.5 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#182032] border-cyan-500 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                  : 'bg-[#0e121c] border-[#1e2536] hover:border-slate-700 hover:bg-[#141a29]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${badge.bg} ${badge.border} ${badge.text} border`}>
                  Step {step.step}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
              </div>

              <div className="text-xs font-semibold text-white truncate">
                {step.title}
              </div>

              <div className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {step.statement}
              </div>

              {isSelected && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-500 rotate-45 rounded-xs" />
              )}
            </button>
          );
        })}
      </div>

      {/* Step Detail Card */}
      <div className="p-4 rounded-lg bg-[#0e121c] border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${activeBadge.bg} ${activeBadge.border} ${activeBadge.text}`}>
              {activeBadge.label}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Epistemic Status: {activeStep.is_fact ? 'DIRECT SCADA MEASUREMENT (GROUND TRUTH)' : 'INDUCTIVE OPERATIONAL INTERPRETATION'}
            </span>
          </div>
          <div className="text-sm font-medium text-slate-200 leading-relaxed pt-1">
            {activeStep.statement}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Supporting Transducers</div>
            <div className="text-xs font-mono text-cyan-300 font-medium">
              {activeStep.supporting_telemetry?.length || 1} Channel(s)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncidentEvidenceChain;
