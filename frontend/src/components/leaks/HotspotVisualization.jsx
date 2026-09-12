import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { ProgressBar } from '../ui/ProgressBar';

export function HotspotVisualization({ hotspotsFlow = [] }) {
  return (
    <SectionCard
      title="Process-to-Equipment Contribution Flow"
      subtitle="Visualizing emission concentration from manufacturing process branches down to specific machinery"
    >
      <div className="space-y-6">
        {hotspotsFlow.map((flow) => (
          <div key={flow.process} className="p-4 rounded bg-[#151923] border border-[#212735]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <span className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                {flow.process}
              </span>
              <span className="text-xs font-mono font-medium text-emerald-400">
                {flow.total_emissions.toLocaleString()} kgCO₂e total
              </span>
            </div>

            <div className="space-y-3 pl-3 border-l-2 border-slate-700">
              {flow.equipment_breakdown.map((eq) => (
                <div key={eq.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200 font-medium">{eq.name}</span>
                      {eq.flag && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            eq.flag.includes('Critical') || eq.flag.includes('High')
                              ? 'bg-red-950/60 text-red-300 border-red-800'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {eq.flag}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-slate-300">
                      {eq.emissions.toLocaleString()} kg ({eq.share}%)
                    </span>
                  </div>
                  <ProgressBar
                    value={eq.share}
                    max={100}
                    variant={
                      eq.flag?.includes('Critical')
                        ? 'red'
                        : eq.flag?.includes('High')
                        ? 'amber'
                        : 'blue'
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
