import React from 'react';

export function LeakRiskBadge({ score, level }) {
  let color = 'bg-slate-800 text-slate-300 border-slate-700';
  let dot = 'bg-slate-400';

  if (score >= 80 || level === 'Critical') {
    color = 'bg-red-950/80 text-red-300 border-red-800/80';
    dot = 'bg-red-400 animate-pulse';
  } else if (score >= 60 || level === 'High') {
    color = 'bg-amber-950/80 text-amber-300 border-amber-800/80';
    dot = 'bg-amber-400';
  } else if (score >= 40 || level === 'Medium') {
    color = 'bg-blue-950/80 text-blue-300 border-blue-800/80';
    dot = 'bg-blue-400';
  } else {
    color = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
    dot = 'bg-emerald-400';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border ${color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {level || (score >= 80 ? 'Critical' : score >= 60 ? 'High' : 'Medium')} ({score})
    </span>
  );
}
