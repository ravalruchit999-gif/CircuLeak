import React from 'react';
import { Gauge, Info, Target, ShieldCheck, Zap, Flame } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';

export function EmissionIntensity({ intensity = 0, scope1 = 0, scope2 = 0, benchmark = 0, unit = 'kgCO₂e / ton product' }) {
  const currentIntensity = Number(intensity || 0);
  const s1 = Number(scope1 || 0);
  const s2 = Number(scope2 || 0);
  const totalScope = s1 + s2;
  const s1Pct = totalScope > 0 ? Math.round((s1 / totalScope) * 100) : 50;
  const s2Pct = totalScope > 0 ? 100 - s1Pct : 50;
  const targetIntensity = currentIntensity > 0 ? (currentIntensity * 0.75).toFixed(1) : '0.0';
  const sectorRef = Number(benchmark || 0);

  return (
    <SectionCard
      title="Carbon Intensity & Accounting"
      subtitle="Specific operational emissions normalized per finished product ton"
      className="h-full flex flex-col"
    >
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        {/* Top Metric Header */}
        <div className="p-3.5 rounded-lg bg-[#141822] border border-[#232b3b]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Current Intensity
            </span>
            {currentIntensity > 0 && sectorRef > 0 ? (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                currentIntensity > sectorRef
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
              }`}>
                {currentIntensity > sectorRef ? `+${((currentIntensity - sectorRef) / sectorRef * 100).toFixed(1)}% vs Sector` : 'Below Sector Cap'}
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Operational Telemetry
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white tracking-tight">
              {currentIntensity > 0 ? currentIntensity : '0.0'}
            </span>
            <span className="text-xs text-slate-400 font-mono">{unit}</span>
          </div>
          {sectorRef > 0 && (
            <p className="text-[11px] text-slate-400 mt-1">
              Sector reference benchmark: <strong className="text-slate-200">{sectorRef} {unit}</strong>
            </p>
          )}
        </div>

        {/* Scope 1 vs Scope 2 Breakdown */}
        {totalScope > 0 && (
          <div className="p-3 rounded-lg bg-[#121620] border border-[#1e2535] text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-slate-300 text-[11px]">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Zap className="w-3.5 h-3.5" /> Scope 2 (Purchased Grid)
              </span>
              <span className="font-bold text-white">{s2.toLocaleString()} kg ({s2Pct}%)</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 text-[11px]">
              <span className="flex items-center gap-1.5 text-orange-400">
                <Flame className="w-3.5 h-3.5" /> Scope 1 (Direct Fuel & Gas)
              </span>
              <span className="font-bold text-white">{s1.toLocaleString()} kg ({s1Pct}%)</span>
            </div>

            <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#1e2637] mt-1">
              <div className="h-full bg-blue-500" style={{ width: `${s2Pct}%` }} />
              <div className="h-full bg-orange-500" style={{ width: `${s1Pct}%` }} />
            </div>
          </div>
        )}

        {/* CircuLeak Achievable Target */}
        {currentIntensity > 0 && (
          <div className="p-3 rounded-lg bg-[#111621] border border-emerald-900/60 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-white font-semibold block text-xs">
                  Target After Interventions
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Calculated top quartile target
                </span>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-emerald-400 font-bold text-sm block">{targetIntensity} kg/t</span>
              <span className="text-[10px] text-emerald-500 font-medium">-25% Targeted Cut</span>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
