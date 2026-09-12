import React, { useState } from 'react';
import { RecommendationCard } from './RecommendationCard';
import { SectionCard } from '../ui/SectionCard';

export function RecommendationList({ recommendations = [], onSelect, onSimulate }) {
  const [filter, setFilter] = useState('ALL');

  const filtered = recommendations.filter((rec) => {
    if (filter === 'ALL') return true;
    return rec.phase.toLowerCase() === filter.toLowerCase();
  });

  return (
    <SectionCard
      title="Prioritized Circular Alternatives"
      subtitle="Engineering interventions recommended based on root-cause anomaly detection"
      action={
        <div className="flex items-center gap-1 text-xs">
          {['ALL', 'Immediate', 'Short Term', 'Medium Term'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded font-mono text-xs transition-colors ${
                filter === cat
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-[#181d28] text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <RecommendationCard
            key={item.id}
            recommendation={item}
            onSelect={onSelect}
            onSimulate={onSimulate}
          />
        ))}
      </div>
    </SectionCard>
  );
}
