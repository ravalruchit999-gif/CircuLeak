import React, { useState } from 'react';
import { ShieldCheck, Calendar, Clock, Database, CheckCircle, ChevronDown, ChevronUp, Layers, Hash } from 'lucide-react';

const STRENGTH_STYLES = {
  STRONG: {
    label: 'STRONG EVIDENCE',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500'
  },
  MODERATE: {
    label: 'MODERATE EVIDENCE',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    badge: 'bg-amber-500'
  },
  WEAK: {
    label: 'WEAK EVIDENCE',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    text: 'text-zinc-400',
    badge: 'bg-zinc-500'
  }
};

export function IncidentEvidenceCards({ evidenceItems = [] }) {
  const [expandedTimestamps, setExpandedTimestamps] = useState({});

  if (!evidenceItems || evidenceItems.length === 0) return null;

  const toggleTimestamps = (id) => {
    setExpandedTimestamps((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="p-6 rounded-xl bg-[#121622] border border-[#1e2536] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold font-mono text-white tracking-wider uppercase">
              Structured Evidence Signals & Timestamp Provenance
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every finding is backed by composite strength scoring and exact, auditable SCADA interval timestamps.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {evidenceItems.map((item) => {
          const strength = STRENGTH_STYLES[item.strength] || STRENGTH_STYLES.MODERATE;
          const isExpanded = expandedTimestamps[item.evidence_id];
          const timestampCount = item.telemetry_timestamps?.length || 0;

          return (
            <div
              key={item.evidence_id}
              className="p-5 rounded-lg bg-[#0e121c] border border-[#1e2536] flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${strength.bg} ${strength.border} ${strength.text}`}>
                      {strength.label}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      item.is_fact
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                        : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                    }`}>
                      {item.is_fact ? '[FACT]' : '[INTERPRETATION]'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {item.evidence_id}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Values Strip */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#141a29] border border-[#1e2536] mb-4">
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Observed</div>
                    <div className="text-xs font-mono font-bold text-white">
                      {item.observed_value !== null ? `${item.observed_value} ${item.unit || ''}` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Reference</div>
                    <div className="text-xs font-mono font-bold text-slate-400">
                      {item.reference_value !== null ? `${item.reference_value} ${item.unit || ''}` : 'None'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Shift %</div>
                    <div className="text-xs font-mono font-bold text-amber-400">
                      {item.difference_percent !== null ? `${item.difference_percent > 0 ? '+' : ''}${item.difference_percent}%` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Technical Audit Metadata */}
                <div className="space-y-1 text-[11px] font-mono text-slate-400 mb-4 border-t border-[#1e2536]/80 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Supports:</span>
                    <span className="text-slate-300 text-right">{item.supports}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sample Count:</span>
                    <span className="text-cyan-400 font-bold">{item.sample_size} interval readings</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sensor Quality:</span>
                    <span className="text-slate-300">{item.data_quality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Baseline Method:</span>
                    <span className="text-slate-300">{item.baseline_method}</span>
                  </div>
                </div>
              </div>

              {/* Exact Timestamps Accordion */}
              {timestampCount > 0 && (
                <div className="border-t border-[#1e2536] pt-3 mt-1">
                  <button
                    type="button"
                    onClick={() => toggleTimestamps(item.evidence_id)}
                    className="w-full flex items-center justify-between text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      View Exact Observation Timestamps ({timestampCount})
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-2.5 rounded bg-[#0a0d14] border border-[#1e2536] max-h-40 overflow-y-auto font-mono text-[10px] space-y-1">
                      <div className="text-slate-500 pb-1 border-b border-[#1e2536] mb-1">
                        Exact SCADA record intervals contributing to this signal:
                      </div>
                      {item.telemetry_timestamps.map((ts, tIdx) => (
                        <div key={tIdx} className="text-slate-300 flex items-center gap-2">
                          <span className="text-slate-600">[{String(tIdx + 1).padStart(2, '0')}]</span>
                          <span>{ts}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IncidentEvidenceCards;
