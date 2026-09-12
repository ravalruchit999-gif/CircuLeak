import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';

export function PageHeader({ title, subtitle, badge, actions }) {
  return (
    <header className="mb-6 pb-4 border-b border-[#1f2634] no-print">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-semibold tracking-tight text-white m-0">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-1 max-w-2xl">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
