import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { ProgressBar } from '../ui/ProgressBar';

export function EmissionBySource({ sources = [] }) {
  return (
    <SectionCard
      title="Emissions by Energy Carrier"
      subtitle="Direct combustion (Gas, Diesel) vs Indirect purchased energy (Grid Electricity)"
    >
      <div className="space-y-4">
        {sources.map((src) => (
          <div key={src.source} className="p-3.5 rounded bg-[#151923] border border-[#212735]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{src.source}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {src.category}
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-slate-100 font-semibold">{src.emissions_kg.toLocaleString()} kg</span>
                <span className="text-slate-400 ml-1.5">({src.share_percent}%)</span>
              </div>
            </div>

            <ProgressBar
              value={src.share_percent}
              max={100}
              variant={src.share_percent > 40 ? 'emerald' : src.share_percent > 20 ? 'blue' : 'amber'}
            />

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-2">
              <span>Emission Factor</span>
              <span>{src.emission_factor}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
