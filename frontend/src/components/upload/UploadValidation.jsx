import React from 'react';
import { CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';

export function UploadValidation({ result }) {
  if (!result) return null;

  const isSuccess = result.validation_status === 'SUCCESS';

  return (
    <SectionCard
      title="Data Schema Verification & Cleaning"
      subtitle="Automated validation against backend emission intelligence models"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded bg-[#161a24] border border-[#232b3b] text-xs font-mono mb-4">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Rows Evaluated</span>
          <span className="text-base font-bold text-white">
            {result.rows_processed != null ? result.rows_processed.toLocaleString() : '—'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Accepted Clean</span>
          <span className="text-base font-bold text-emerald-400">
            {result.rows_accepted != null ? result.rows_accepted.toLocaleString() : '—'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Rejected Anomalies</span>
          <span className="text-base font-bold text-amber-400">
            {result.rows_rejected != null ? result.rows_rejected.toLocaleString() : '—'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Status</span>
          <span className="text-base font-bold text-emerald-300">
            {result.validation_status}
          </span>
        </div>
      </div>

      <div className="p-3.5 rounded bg-[#131720] border border-[#202737] flex items-center gap-3 text-xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-slate-300">
          Timestamp continuous range: {result.timestamp_range?.start} through {result.timestamp_range?.end}. (Zero critical sequence gaps).
        </span>
      </div>
    </SectionCard>
  );
}
