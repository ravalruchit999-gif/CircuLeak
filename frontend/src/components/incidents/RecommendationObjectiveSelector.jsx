import React from 'react';
import { Target, DollarSign, Flame, Clock, RefreshCw, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

const OBJECTIVES = [
  {
    id: 'payback',
    label: 'Fastest Payback',
    icon: DollarSign,
    color: 'emerald',
    description: 'Prioritizes shortest payback period and immediate financial return.',
  },
  {
    id: 'carbon',
    label: 'Max Carbon Abatement',
    icon: Flame,
    color: 'amber',
    description: 'Prioritizes maximum lifetime metric tons of CO2 avoided.',
  },
  {
    id: 'capex',
    label: 'Lowest Upfront Capex',
    icon: Target,
    color: 'blue',
    description: 'Prioritizes minimal upfront capital investment.',
  },
  {
    id: 'disruption',
    label: 'Minimal Disruption',
    icon: Clock,
    color: 'purple',
    description: 'Prioritizes zero/low downtime and non-disruptive installation.',
  },
  {
    id: 'circularity',
    label: 'Circular Loops',
    icon: RefreshCw,
    color: 'cyan',
    description: 'Prioritizes closed-loop material, condensate, or heat recovery.',
  },
];

export function RecommendationObjectiveSelector({
  context,
  onContextChange,
  loading = false,
}) {
  const [showConstraints, setShowConstraints] = React.useState(false);

  const handleObjectiveClick = (objId) => {
    onContextChange({
      ...context,
      primary_objective: objId,
    });
  };

  const handleConstraintChange = (field, value) => {
    onContextChange({
      ...context,
      [field]: value === '' ? null : value,
    });
  };

  return (
    <div className="bg-[#121622] rounded-xl border border-[#1e2536] p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Decision Optimization Objective
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interventions are dynamically rescored based on your operational priority and constraint boundaries.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowConstraints(!showConstraints)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#192030] text-slate-300 hover:text-white border border-[#273248] hover:border-slate-600 transition-colors self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Constraint Filters</span>
          {showConstraints ? (
            <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
          )}
        </button>
      </div>

      {/* Objective Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {OBJECTIVES.map((obj) => {
          const isSelected = (context.primary_objective || 'payback') === obj.id;
          const Icon = obj.icon;

          return (
            <button
              key={obj.id}
              type="button"
              disabled={loading}
              onClick={() => handleObjectiveClick(obj.id)}
              className={`p-3 rounded-lg border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-950/30 border-emerald-500/70 shadow-sm shadow-emerald-900/30'
                  : 'bg-[#151a28] border-[#222b3e] hover:border-slate-600 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`p-1.5 rounded-md ${
                    isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#1b2233] text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                {isSelected && (
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <div>
                <span
                  className={`text-xs font-semibold block leading-tight ${
                    isSelected ? 'text-emerald-300' : 'text-slate-300'
                  }`}
                >
                  {obj.label}
                </span>
                <span className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {obj.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expandable Constraint Filters Drawer */}
      {showConstraints && (
        <div className="p-4 rounded-lg bg-[#0e121c] border border-[#1e2536] mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              Max Capex Budget (₹ INR)
            </label>
            <input
              type="number"
              placeholder="Leave empty for No Limit"
              value={context.max_capex_inr || ''}
              onChange={(e) => handleConstraintChange('max_capex_inr', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full px-3 py-1.5 rounded bg-[#161c2b] border border-[#273248] text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              Catalog solutions start from ₹45,000. Leave blank for no limit.
            </span>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              Max Payback Limit (Years)
            </label>
            <input
              type="number"
              step="0.5"
              placeholder="Leave empty for No Limit"
              value={context.max_payback_years || ''}
              onChange={(e) => handleConstraintChange('max_payback_years', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full px-3 py-1.5 rounded bg-[#161c2b] border border-[#273248] text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              Leave blank for no limit (typical: 1.5 - 3.5 yrs).
            </span>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-300 block mb-1">
              Acceptable Disruption
            </label>
            <select
              value={context.acceptable_disruption || 'High'}
              onChange={(e) => handleConstraintChange('acceptable_disruption', e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-[#161c2b] border border-[#273248] text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="Low">Low (Zero Process Interruption)</option>
              <option value="Medium">Medium (Scheduled Weekend Downtime)</option>
              <option value="High">High (Any Necessary Outage)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
