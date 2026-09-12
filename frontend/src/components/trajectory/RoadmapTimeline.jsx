import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export function RoadmapTimeline({ milestones = [] }) {
  return (
    <SectionCard
      title="Technology & Operational Roadmap"
      subtitle="Structured multi-year roadmap from immediate anomaly resolution to long-term circularity"
    >
      <div className="relative border-l border-slate-700 ml-3 space-y-6 py-2">
        {milestones.map((m) => (
          <div key={m.year} className="relative pl-6">
            <div className="absolute -left-2.5 top-0.5 w-5 h-5 rounded-full bg-[#141822] border-2 border-emerald-500 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>

            <div className="p-3.5 rounded bg-[#131720] border border-[#212735] hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {m.year}
                </span>
                <span className="text-xs font-semibold text-slate-100">{m.title}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{m.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
