import React from 'react';
import { Gauge, Info, Target, ShieldCheck, Zap, Flame } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';

export function EmissionIntensity({ intensity = 101, unit = 'kgCO₂e / ton product' }) {
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
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
              +18.8% vs Sector
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white tracking-tight">
              {intensity}
            </span>
            <span className="text-xs text-slate-400 font-mono">{unit}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Regional sector benchmark: <strong className="text-slate-200">85 kgCO₂e / ton</strong>
          </p>
        </div>

        {/* Scope 1 vs Scope 2 Breakdown */}
        <div className="p-3 rounded-lg bg-[#121620] border border-[#1e2535] text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-slate-300 text-[11px]">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Zap className="w-3.5 h-3.5" /> Scope 2 (Purchased Grid)
            </span>
            <span className="font-bold text-white">6,720 kg (54%)</span>
          </div>
          <div className="flex items-center justify-between text-slate-300 text-[11px]">
            <span className="flex items-center gap-1.5 text-orange-400">
              <Flame className="w-3.5 h-3.5" /> Scope 1 (Direct Fuel & Gas)
            </span>
            <span className="font-bold text-white">5,730 kg (46%)</span>
          </div>

          <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#1e2637] mt-1">
            <div className="h-full bg-blue-500" style={{ width: '54%' }} />
            <div className="h-full bg-orange-500" style={{ width: '46%' }} />
          </div>
        </div>

        {/* CircuLeak Achievable Target */}
        <div className="p-3 rounded-lg bg-[#111621] border border-emerald-900/60 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-white font-semibold block text-xs">
                Target After Interventions
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Places facility in Top Quartile
              </span>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-emerald-400 font-bold text-sm block">75.4 kg/ton</span>
            <span className="text-[10px] text-emerald-500 font-medium">-25.3% Cut</span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
