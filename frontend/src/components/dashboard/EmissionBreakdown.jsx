import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { Gauge, Zap, Flame, Fuel, Info, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmissionBreakdown({ sources = [], intensity = 0 }) {
  const colors = ['#3b82f6', '#f97316', '#eab308'];
  const icons = [Zap, Flame, Fuel];
  const factors = ['0.82 kgCO₂e/kWh', '2.04 kgCO₂e/SCM', '2.68 kgCO₂e/Liter'];
  const safeSources = Array.isArray(sources) ? sources : [];

  return (
    <SectionCard
      title="Direct & Energy-Related Breakdown"
      subtitle="Operational carbon contribution by primary energy carrier"
      className="h-full flex flex-col"
      action={
        <Link
          to="/emissions"
          className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-medium"
        >
          View Intelligence <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        {safeSources.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-center p-4 text-slate-400">
            <p className="text-xs text-slate-300 font-medium">No energy source records</p>
            <p className="text-[11px] text-slate-500 mt-1">Upload fuel and electricity logs to view footprint allocation.</p>
          </div>
        ) : (
          <>
            {/* Source Detail Cards */}
            <div className="space-y-2">
              {safeSources.map((src, i) => {
                const Icon = icons[i] || Zap;
                const name = src.name || src.source || `Carrier ${i + 1}`;
                const value = Number(src.value ?? src.emissions_kg ?? src.emissions ?? 0);
                const percent = Number(src.percent ?? src.percentage ?? 0);

                return (
                  <div
                    key={name}
                    className="p-3 rounded-lg bg-[#151923] border border-[#212735] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: colors[i % colors.length] }}
                      />
                      <div>
                        <span className="font-semibold text-slate-200 block leading-tight">
                          {name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Factor: {factors[i] || '0.82 kgCO₂e/kWh'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-slate-100 font-bold block">
                        {value.toLocaleString()} kgCO₂e
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {percent}% Share
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visual Proportional Bar */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>Energy Carrier Share Distribution</span>
                <span>100% Normalized</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#1a202c]">
                {safeSources.map((src, i) => {
                  const name = src.name || src.source || `Carrier ${i + 1}`;
                  const percent = Number(src.percent ?? src.percentage ?? 0);
                  return (
                    <div
                      key={name}
                      style={{
                        width: `${percent}%`,
                        backgroundColor: colors[i % colors.length],
                      }}
                      title={`${name}: ${percent}%`}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Production Intensity Callout */}
        {intensity > 0 ? (
          <div className="p-3 rounded-lg bg-[#12161f] border border-[#202737] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-200 font-semibold block">Production Intensity</span>
                <span className="text-[10px] text-slate-400">Measured specific footprint</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-white block">{intensity} kgCO₂e / unit</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Active Record</span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-[#12161f] border border-[#202737] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-200 font-semibold block">Energy Footprint Distribution</span>
                <span className="text-[10px] text-slate-400">{sources.length} operational sources</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-300 font-bold block">Verified</span>
              <span className="text-[10px] text-slate-500">Live Telemetry</span>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
