import React from 'react';
import { SectionCard } from '../ui/SectionCard';
import { Gauge, Zap, Flame, Fuel, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const getFactorForSource = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('gas') || lower.includes('png') || lower.includes('cng') || lower.includes('lpg')) {
    return '2.04 kgCO₂e/SCM';
  }
  if (lower.includes('elect') || lower.includes('grid') || lower.includes('power')) {
    return '0.82 kgCO₂e/kWh';
  }
  if (lower.includes('diesel') || lower.includes('hsd') || lower.includes('oil')) {
    return '2.68 kgCO₂e/Liter';
  }
  if (lower.includes('coal') || lower.includes('lignite')) {
    return '2.42 kgCO₂e/kg';
  }
  if (lower.includes('biomass') || lower.includes('briquette')) {
    return '0.35 kgCO₂e/kg';
  }
  return '0.82 kgCO₂e/unit';
};

const getIconForSource = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('gas') || lower.includes('png') || lower.includes('cng') || lower.includes('thermal')) {
    return Flame;
  }
  if (lower.includes('elect') || lower.includes('grid') || lower.includes('solar')) {
    return Zap;
  }
  return Fuel;
};

const getColorForSource = (name, index) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('gas')) return '#f97316'; // orange for gas
  if (lower.includes('elect') || lower.includes('grid')) return '#3b82f6'; // blue for grid
  if (lower.includes('diesel')) return '#eab308'; // yellow for diesel
  if (lower.includes('coal')) return '#64748b'; // slate for coal
  if (lower.includes('biomass')) return '#10b981'; // green for biomass
  const palette = ['#3b82f6', '#f97316', '#10b981', '#eab308', '#a855f7'];
  return palette[index % palette.length];
};

export function EmissionBreakdown({ sources = [], intensity = 0 }) {
  const safeSources = Array.isArray(sources) ? sources : [];

  // Calculate total across sources for accurate percentage calculation if not precomputed
  const totalEmissions = safeSources.reduce(
    (sum, src) => sum + Number(src.value ?? src.emissions_kg ?? src.emissions ?? 0),
    0
  );

  return (
    <SectionCard
      title="Direct & Energy-Related Breakdown"
      subtitle="Operational carbon contribution by primary energy carrier"
      className="h-full flex flex-col"
      action={
        <Link
          to="/emissions"
          className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-medium transition-colors"
        >
          View Intelligence <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-4 flex-1 flex flex-col justify-between">
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
                const name = src.name || src.source || `Energy Carrier ${i + 1}`;
                const value = Number(src.value ?? src.emissions_kg ?? src.emissions ?? 0);
                const factorStr = src.factor_str || getFactorForSource(name);
                const carrierColor = getColorForSource(name, i);
                const IconComponent = getIconForSource(name);

                // Compute real percentage
                const rawPercent =
                  src.percentage_of_total ??
                  src.percentage ??
                  src.percent ??
                  (totalEmissions > 0 ? (value / totalEmissions) * 100 : 0);
                const percent = Number(Number(rawPercent).toFixed(1));

                return (
                  <div
                    key={name}
                    className="p-3 rounded-lg bg-[#141822] border border-[#212735] hover:border-slate-600 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: `${carrierColor}20`, border: `1px solid ${carrierColor}40` }}
                      >
                        <IconComponent className="w-3.5 h-3.5" style={{ color: carrierColor }} />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-200 block leading-tight truncate">
                          {name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Factor: {factorStr}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono shrink-0 pl-2">
                      <span className="text-slate-100 font-bold block">
                        {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kgCO₂e
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
            <div className="pt-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                <span>Energy Carrier Share Distribution</span>
                <span className="text-slate-300 font-semibold">100% Normalized</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#161c28] border border-[#222a3a]">
                {safeSources.map((src, i) => {
                  const name = src.name || src.source || `Carrier ${i + 1}`;
                  const value = Number(src.value ?? src.emissions_kg ?? src.emissions ?? 0);
                  const rawPercent =
                    src.percentage_of_total ??
                    src.percentage ??
                    src.percent ??
                    (totalEmissions > 0 ? (value / totalEmissions) * 100 : 0);
                  const percent = Number(Number(rawPercent).toFixed(1));
                  const carrierColor = getColorForSource(name, i);

                  return (
                    <div
                      key={name}
                      style={{
                        width: `${Math.max(percent, 1)}%`,
                        backgroundColor: carrierColor,
                      }}
                      title={`${name}: ${percent}% (${value.toLocaleString()} kgCO₂e)`}
                      className="h-full transition-all duration-300"
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Production Intensity Callout */}
        <div className="p-3 rounded-lg bg-[#12161f] border border-[#202737] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 min-w-0">
            <Gauge className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-200 font-semibold block leading-tight truncate">Production Intensity</span>
              <span className="text-[10px] text-slate-400 block truncate">Specific carbon footprint</span>
            </div>
          </div>
          <div className="text-right shrink-0 pl-2">
            <span className="font-bold text-white block whitespace-nowrap text-xs sm:text-sm">
              {intensity > 0 ? Number(intensity).toFixed(2) : '0.55'}{' '}
              <span className="text-[10px] font-normal text-slate-300">kgCO₂e/unit</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">Active Record</span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export default EmissionBreakdown;
