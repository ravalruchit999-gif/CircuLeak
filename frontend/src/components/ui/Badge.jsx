import React from 'react';

export function Badge({
  children,
  variant = 'neutral', // 'neutral' | 'red' | 'amber' | 'emerald' | 'blue' | 'purple'
  size = 'md', // 'sm' | 'md'
  className = '',
}) {
  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-[10px] tracking-wide font-medium',
    md: 'px-2 py-0.5 text-xs font-medium',
  };

  const variantStyles = {
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700',
    red: 'bg-red-950/70 text-red-300 border border-red-800/80',
    amber: 'bg-amber-950/70 text-amber-300 border border-amber-800/80',
    emerald: 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80',
    blue: 'bg-blue-950/70 text-blue-300 border border-blue-800/80',
    purple: 'bg-purple-950/70 text-purple-300 border border-purple-800/80',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded tracking-tight ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {children}
    </span>
  );
}
