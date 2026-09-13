import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';
import { StatusBadge } from '../ui/StatusBadge';

export function AnomalySummary({ anomalies }) {
  const rawList = anomalies?.critical_alerts || anomalies?.anomalies || anomalies?.items || [];
  const alerts = Array.isArray(rawList) ? rawList : [];

  const hasAlerts = alerts.length > 0;

  return (
    <SectionCard
      title="Active Carbon Leak Alerts"
      subtitle="Operational consumption spikes detected during off-peak and inactive shifts"
      className="h-full flex flex-col"
      badge={
        hasAlerts ? (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 animate-pulse font-semibold">
            {alerts.length} Flagged
          </span>
        ) : (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Nominal Baseline
          </span>
        )
      }
    >
      <div className="space-y-2.5 flex-1 flex flex-col justify-between">
        {hasAlerts ? (
          alerts.slice(0, 3).map((alert, idx) => {
            const leakId = alert.leak_id || alert.id || (idx + 1);
            const equipment = alert.equipment || 'Monitored Asset';
            const alertType = alert.type || alert.process || alert.reason || 'Off-Hours Standby Spike';
            const riskScore = alert.risk_score || 75;
            const period = alert.period || alert.abnormal_period || 'Off-Peak Shift';
            const deviation = Math.round(
              alert.deviation_percent ??
                (alert.observed_consumption && alert.baseline_consumption
                  ? ((alert.observed_consumption - alert.baseline_consumption) / alert.baseline_consumption) * 100
                  : 22)
            );

            return (
              <div
                key={leakId}
                className="p-3 rounded-lg bg-[#141822] border border-[#232b3b] hover:border-slate-500 transition-all flex flex-col justify-between gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1 rounded bg-red-950/80 text-red-400 border border-red-800/80 shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white tracking-tight truncate">
                        {equipment}
                      </h4>
                      <span className="text-[11px] text-slate-400 block truncate">{alertType}</span>
                    </div>
                  </div>
                  <StatusBadge score={riskScore} />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-[#1d2432]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {period}
                  </span>
                  <span className="text-red-400 font-bold">
                    +{deviation}% Deviation
                  </span>
                </div>

                <Link
                  to={`/leaks/${leakId}`}
                  className="inline-flex items-center justify-center gap-1 text-xs font-medium py-1.5 px-2.5 rounded bg-[#1c2332] text-slate-200 hover:bg-emerald-950/80 hover:text-emerald-300 hover:border-emerald-700/80 border border-[#2b3548] transition-all"
                >
                  Analyze Root Cause <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })
        ) : (
          /* Reassuring, sleek zero-alert state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 rounded-lg bg-[#121622]/60 border border-[#1e2535] border-dashed my-auto">
            <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 mb-3 shadow-sm shadow-emerald-950">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-200 tracking-tight">
              All Equipment Within Normal Baseline
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
              Continuous Isolation Forest ML telemetry monitoring active. Zero unmitigated standby anomalies or excessive carbon leaks detected in the current shift.
            </p>
            <Link
              to="/leaks"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <span>Explore Carbon Incident Registry</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
export default AnomalySummary;
