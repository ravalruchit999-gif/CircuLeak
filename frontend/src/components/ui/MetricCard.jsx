import React from 'react';

export function MetricCard({
  title,
  value,
  unit = '',
  delta = null, // e.g. '+45%' or '-25.3%'
  deltaType = 'neutral', // 'positive_is_good' | 'positive_is_bad' | 'neutral'
  subtext = '',
  icon: Icon,
  className = '',
  highlight = false,
}) {
  let deltaColor = 'text-slate-400 bg-slate-800/80';
  if (delta) {
    const isPositive = delta.startsWith('+') || parseFloat(delta) > 0;
    if (deltaType === 'positive_is_good') {
      deltaColor = isPositive ? 'text-emerald-400 bg-emerald-950/60' : 'text-red-400 bg-red-950/60';
    } else if (deltaType === 'positive_is_bad') {
      deltaColor = isPositive ? 'text-red-400 bg-red-950/60' : 'text-emerald-400 bg-emerald-950/60';
    }
  }

  return (
    <div
      className={`relative p-4 rounded bg-[#131720] border ${
        highlight ? 'border-amber-500/40 bg-[#161a24]' : 'border-[#222938]'
      } transition-colors hover:border-[#323d52] ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 truncate">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-slate-500 shrink-0" />}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl lg:text-3xl font-semibold tracking-tight text-white font-mono">
          {value}
        </span>
        {unit && <span className="text-xs font-normal text-slate-400">{unit}</span>}
      </div>

      <div className="flex items-center justify-between gap-2 mt-2">
        {subtext && <p className="text-xs text-slate-400 truncate">{subtext}</p>}
        {delta && (
          <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded shrink-0 ${deltaColor}`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
