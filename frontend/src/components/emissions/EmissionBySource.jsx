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
        {sources.map((src) => {
          const sourceName = src.source || src.name;
          const share = src.share_percent ?? src.percentage_of_total ?? 0;
          const category = src.category || (sourceName?.toLowerCase().includes('electricity') ? 'Energy-Related' : 'Direct Fuel');
          const factor = src.emission_factor || (src.intensity_per_unit ? `${src.intensity_per_unit} kgCO₂e/unit` : 'Standard Factor');
          const emissionsVal = (src.emissions_kg || 0).toLocaleString();

          return (
            <div key={sourceName} className="p-3.5 rounded bg-[#151923] border border-[#212735]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{sourceName}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {category}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-slate-100 font-semibold">{emissionsVal} kg</span>
                  <span className="text-slate-400 ml-1.5">({share}%)</span>
                </div>
              </div>

              <ProgressBar
                value={share}
                max={100}
                variant={share > 40 ? 'emerald' : share > 20 ? 'blue' : 'amber'}
              />

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-2">
                <span>Emission Factor</span>
                <span>{factor}</span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
