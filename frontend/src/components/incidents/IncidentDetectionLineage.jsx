import React from 'react';
import { Cpu, Hash, GitBranch, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';

export function IncidentDetectionLineage({ incident, confidence }) {
  if (!incident) return null;

  const confLevel = (confidence?.level || 'Medium').toLowerCase();

  const getConfBadge = () => {
    switch (confLevel) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            HIGH CONFIDENCE
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <AlertCircle className="w-3.5 h-3.5" />
            LOW CONFIDENCE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-800">
            <ShieldAlert className="w-3.5 h-3.5" />
            MEDIUM CONFIDENCE
          </span>
        );
    }
  };

  return (
    <SectionCard
      title="DETECTION METHODOLOGY & LINEAGE"
      subtitle="Complete algorithmic traceability and cryptographic dataset lineage"
      className="mb-6"
      badge={getConfBadge()}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Detection Method */}
        <div className="p-3.5 rounded-lg bg-[#141824] border border-[#21293c]">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1 flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-slate-500" />
            Detection Method
          </span>
          <span className="text-xs font-bold text-slate-200 font-mono block">
            {incident.detection_method || 'Isolation Forest'}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            Historical/operational anomaly detection
          </span>
        </div>

        {/* Model Version */}
        <div className="p-3.5 rounded-lg bg-[#141824] border border-[#21293c]">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1 flex items-center gap-1.5">
            <GitBranch className="w-3 h-3 text-slate-500" />
            Model Version
          </span>
          <span className="text-xs font-bold text-slate-200 font-mono block">
            {incident.model_name || 'IsolationForest'} v{incident.model_version || '1.0.0'}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            Deterministic anomaly score
          </span>
        </div>

        {/* Analysis Run ID */}
        <div className="p-3.5 rounded-lg bg-[#141824] border border-[#21293c]">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1 flex items-center gap-1.5">
            <Hash className="w-3 h-3 text-slate-500" />
            Analysis Run
          </span>
          <span className="text-xs font-bold text-amber-400 font-mono block truncate" title={incident.analysis_run_id}>
            {incident.analysis_run_id || 'Unavailable'}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            Reproducible run ID
          </span>
        </div>

        {/* Dataset Cryptographic Hash */}
        <div className="p-3.5 rounded-lg bg-[#141824] border border-[#21293c]">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1 flex items-center gap-1.5">
            <Hash className="w-3 h-3 text-slate-500" />
            Dataset SHA-256
          </span>
          <span className="text-xs font-mono text-slate-300 block truncate" title={incident.dataset_hash_sha256}>
            {incident.dataset_hash_sha256 ? `${incident.dataset_hash_sha256.slice(0, 16)}...` : 'Unavailable'}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            Immutable audit trail
          </span>
        </div>
      </div>

      {/* Confidence Rationale & Strict Historical Disclaimer */}
      <div className="p-3 rounded-lg bg-[#0e121a] border border-[#1b2230] space-y-1.5 text-xs font-mono text-slate-400">
        <div className="flex items-start gap-2">
          <strong className="text-slate-300">Confidence Rationale:</strong>
          <span>{confidence?.reason || 'Based on historical sample volume, baseline consistency, and deviation threshold.'}</span>
        </div>
        <div className="text-[11px] text-slate-500">
          * Notice: Detected from historical operational telemetry. The model flags past uncharacteristic behavior; it does not predict future equipment failure.
        </div>
      </div>
    </SectionCard>
  );
}
