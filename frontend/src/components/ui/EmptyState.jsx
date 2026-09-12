import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title = 'No Data Available',
  description = 'There is currently no information recorded for this view.',
  actionLabel,
  onAction,
  icon: Icon = AlertCircle,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded border border-dashed border-[#2b3345] bg-[#11141b]/50 ${className}`}>
      <div className="w-10 h-10 rounded bg-[#1c2230] flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
