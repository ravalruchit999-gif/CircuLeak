import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

export function AuditFindings({ findings = [] }) {
  return (
    <SectionCard
      title="Key Operational & Anomaly Findings"
      subtitle="Critical emission leaks and efficiency discrepancies verified during the diagnostic evaluation"
    >
      <div className="space-y-3">
        {findings.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded bg-[#141822] border border-[#212735] space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-100 uppercase tracking-wide">
                {item.category}
              </span>
              <StatusBadge status={item.risk_level} />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.finding}</p>

            <div className="text-[11px] font-mono text-amber-400/90 pt-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Financial & Carbon Impact: {item.impact}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
