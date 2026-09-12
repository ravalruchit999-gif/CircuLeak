import React from 'react';

export function LoadingState({
  rows = 4,
  message = 'Retrieving industrial process data...',
  className = '',
}) {
  return (
    <div className={`p-6 rounded bg-[#12161f] border border-[#212736] ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">{message}</span>
      </div>

      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-9 rounded bg-[#181e2b] animate-pulse"
            style={{ width: `${100 - i * 8}%` }}
          />
        ))}
      </div>
    </div>
  );
}
