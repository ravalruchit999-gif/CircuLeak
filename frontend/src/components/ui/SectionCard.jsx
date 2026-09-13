import React from 'react';

export function SectionCard({
  title,
  subtitle,
  badge,
  action,
  children,
  className = '',
  bodyClassName = 'p-5',
}) {
  return (
    <div className={`rounded-lg bg-[#12161f] border border-[#212736] overflow-hidden ${className}`}>
      {(title || subtitle || action || badge) && (
        <div className="px-5 py-3.5 border-b border-[#212736] flex flex-wrap items-center justify-between gap-3 bg-[#151a24]/60 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              {title && <h3 className="text-sm font-semibold text-slate-100 tracking-tight">{title}</h3>}
              {badge}
            </div>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={`flex-1 flex flex-col ${bodyClassName}`}>{children}</div>
    </div>
  );
}
