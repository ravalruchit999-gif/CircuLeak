import React from 'react';
import { ArrowRight, Database, ArrowLeft, Wrench, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionCard } from '../ui/SectionCard';
import { Button } from '../ui/Button';

export function IncidentNextSteps({ nextSteps = [], incidentId }) {
  const steps = Array.isArray(nextSteps) && nextSteps.length > 0
    ? nextSteps
    : ['Further investigation requires additional operational telemetry.'];

  return (
    <SectionCard
      title="WHAT SHOULD YOU INVESTIGATE NEXT?"
      subtitle="Operational and engineering investigation actions supported by detected evidence"
      className="mb-6 border-amber-950/40"
      badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
          INVESTIGATION CHECKLIST
        </span>
      }
    >
      <div className="space-y-2.5 mb-5">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#141824] border border-[#222b3e] text-xs text-slate-200"
          >
            <div className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-800 font-mono text-[11px] font-bold">
              {idx + 1}
            </div>
            <div className="font-sans leading-relaxed pt-0.5">{step}</div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-lg bg-[#11151f] border border-[#1d2332] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Trace underlying records: inspect raw meter readings ingested for this incident.
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Link to="/data-upload">
            <Button variant="secondary" size="sm" icon={Database}>
              View Source Telemetry
            </Button>
          </Link>
          <Link to="/leaks">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Registry
            </Button>
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
