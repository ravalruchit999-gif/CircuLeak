import React from 'react';
import { Button } from '../ui/Button';
import { Sliders, RefreshCw, Sparkles } from 'lucide-react';

export function SimulationControls({ selectedCount, totalCount, onReset, simulating }) {
  return (
    <div className="p-4 rounded bg-[#131720] border border-[#212838] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
            Interactive What-If Simulation Engine
          </h3>
          <p className="text-xs text-slate-400">
            Select circular alternatives below to calculate live carbon abatement, financial savings, and payback.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs">
        <span className="text-slate-400">
          Selected: <strong className="text-emerald-400">{selectedCount}</strong> / {totalCount}
        </span>
        {onReset && (
          <Button variant="outline" size="sm" onClick={onReset} icon={RefreshCw}>
            Reset Selection
          </Button>
        )}
      </div>
    </div>
  );
}
