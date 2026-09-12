import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Zap, Clock, Wrench, ShieldCheck, DollarSign } from 'lucide-react';
import { formatCurrency, formatPayback } from '../../utils/formatters';

export function RecommendationDetails({ recommendation, isOpen, onClose, onSimulate }) {
  if (!recommendation) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Engineering Specification: ${recommendation.id}`}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {recommendation.category}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Priority Rank #{recommendation.priority_score}
            </span>
          </div>
          <h3 className="text-base font-semibold text-white">{recommendation.title}</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {recommendation.why_recommended}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded bg-[#161a24] border border-[#263042] text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Capital Investment</span>
            <span className="text-sm font-semibold text-slate-100">
              {formatCurrency(recommendation.investment)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Annual Savings</span>
            <span className="text-sm font-semibold text-emerald-400">
              {formatCurrency(recommendation.annual_savings)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Simple Payback</span>
            <span className="text-sm font-semibold text-white">
              {formatPayback(recommendation.payback_years)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Daily CO₂ Avoided</span>
            <span className="text-sm font-semibold text-emerald-400">
              -{recommendation.co2_reduction} kg/day
            </span>
          </div>
        </div>

        {/* Engineering & Implementation Details */}
        <div className="space-y-2 pt-2 border-t border-[#1f2635]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Installation & Operations Scope
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded bg-[#141822] border border-[#212735] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                <Wrench className="w-3 h-3 text-amber-400" /> Equipment & Vendor Type
              </span>
              <p className="text-slate-200 font-medium">
                {recommendation.engineering_specs?.equipment_type || 'Industrial Control Module'}
              </p>
              <p className="text-slate-400 text-[11px]">
                Vendor: {recommendation.engineering_specs?.contractor_type || 'OEM Specialist'}
              </p>
            </div>

            <div className="p-3 rounded bg-[#141822] border border-[#212735] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" /> Maintenance Downtime
              </span>
              <p className="text-slate-200 font-medium">
                {recommendation.engineering_specs?.downtime_needed || 'Minimal operational disruption'}
              </p>
              <p className="text-slate-400 text-[11px]">
                Implementation lead time: {recommendation.implementation_time}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1f2635]">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          {onSimulate && (
            <Button
              variant="primary"
              size="sm"
              icon={Zap}
              onClick={() => {
                onSimulate(recommendation.id);
                onClose();
              }}
            >
              Simulate in What-If
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
