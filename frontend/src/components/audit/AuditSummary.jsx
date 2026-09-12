import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { FileCheck, Calendar, ShieldCheck, Building } from 'lucide-react';

export function AuditSummary({ audit }) {
  if (!audit) return null;

  return (
    <SectionCard
      title="Executive Audit Memorandum"
      subtitle="Formal carbon diagnostic certification prepared for plant leadership"
      badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
          Certified Diagnostic
        </span>
      }
    >
      <div className="space-y-4">
        {/* Document Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded bg-[#151923] border border-[#212735] text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Audit Reference</span>
            <span className="font-semibold text-slate-200">{audit.audit_id}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Assessment Date</span>
            <span className="font-semibold text-slate-200">{audit.audit_date}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Facility Under Audit</span>
            <span className="font-semibold text-slate-200 truncate block">
              {audit.facility_name}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Lead Engine</span>
            <span className="font-semibold text-emerald-400 truncate block">
              {audit.lead_auditor}
            </span>
          </div>
        </div>

        {/* Narrative Executive Summary */}
        <div className="p-4 rounded bg-[#151a24] border border-[#232b3b]">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" /> Executive Diagnostic Summary
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans text-justify">
            {audit.executive_summary}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
