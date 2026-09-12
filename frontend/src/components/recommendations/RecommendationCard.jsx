import React from 'react';
import { Zap, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatCurrency, formatPayback } from '../../utils/formatters';
import { Button } from '../ui/Button';

export function RecommendationCard({ recommendation, onSelect, onSimulate }) {
  if (!recommendation) return null;

  return (
    <div className="p-5 rounded bg-[#131720] border border-[#232b3b] hover:border-slate-600 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                {recommendation.category}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                Phase: {recommendation.phase}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white tracking-tight">
              {recommendation.title}
            </h4>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-bold text-emerald-400 block">
              -{recommendation.co2_reduction} kg/day
            </span>
            <span className="text-[10px] text-slate-400 font-mono">CO₂ Abatement</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {recommendation.why_recommended}
        </p>

        {/* 4 Financial Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded bg-[#161c27] border border-[#212735] text-xs font-mono mb-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Capital Outlay</span>
            <span className="text-slate-100 font-semibold">
              {formatCurrency(recommendation.investment)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Annual Savings</span>
            <span className="text-emerald-400 font-semibold">
              {formatCurrency(recommendation.annual_savings)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Payback</span>
            <span className="text-white font-semibold">
              {formatPayback(recommendation.payback_years)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Target Machine</span>
            <span className="text-slate-300 truncate block">
              {recommendation.target_equipment}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#1f2635] text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Timeline: {recommendation.implementation_time}</span>
        </div>

        <div className="flex items-center gap-2">
          {onSelect && (
            <Button variant="ghost" size="sm" onClick={() => onSelect(recommendation)}>
              Engineering Specs
            </Button>
          )}
          {onSimulate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSimulate(recommendation.id)}
              icon={Zap}
            >
              Simulate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
