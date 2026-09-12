import React from 'react';

export function ProgressBar({
  value = 0,
  max = 100,
  variant = 'emerald', // 'emerald' | 'amber' | 'red' | 'blue'
  showLabel = false,
  label = '',
  className = '',
}) {
  const percentage = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;

  const variantStyles = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="text-slate-400 truncate">{label}</span>
          <span className="font-mono text-slate-200">{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-[#1e2533] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${variantStyles[variant] || variantStyles.emerald}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
