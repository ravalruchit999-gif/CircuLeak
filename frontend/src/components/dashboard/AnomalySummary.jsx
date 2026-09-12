import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';
import { StatusBadge } from '../ui/StatusBadge';

export function AnomalySummary({ anomalies }) {
  const alerts = anomalies?.critical_alerts || [];

  return (
    <SectionCard
      title="Active Carbon Leak Alerts"
      subtitle="Operational consumption spikes detected during off-peak and inactive shifts"
      className="h-full flex flex-col"
      badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 animate-pulse">
          {alerts.length} Flagged
        </span>
      }
    >
      <div className="space-y-2.5 flex-1 flex flex-col justify-between">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-3 rounded-lg bg-[#141822] border border-[#232b3b] hover:border-slate-500 transition-all flex flex-col justify-between gap-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-red-950/80 text-red-400 border border-red-800/80 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight">
                    {alert.equipment}
                  </h4>
                  <span className="text-[11px] text-slate-400 block">{alert.type}</span>
                </div>
              </div>
              <StatusBadge score={alert.risk_score} />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-[#1d2432]">
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3 text-slate-400" />
                {alert.period}
              </span>
              <span className="text-red-400 font-bold">
                +{alert.deviation_percent}% Deviation
              </span>
            </div>

            <Link
              to={`/leaks/${alert.id}`}
              className="inline-flex items-center justify-center gap-1 text-xs font-medium py-1 px-2.5 rounded bg-[#1c2332] text-slate-200 hover:bg-emerald-950/80 hover:text-emerald-300 hover:border-emerald-700/80 border border-[#2b3548] transition-all"
            >
              Analyze Root Cause <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
