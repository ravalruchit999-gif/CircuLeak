import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { NAV_ITEMS } from '../../constants/navigation';

export function Breadcrumbs() {
  const location = useLocation();
  const path = location.pathname;

  const currentItem = NAV_ITEMS.find((item) => item.path === path);
  const isLeakDetail = path.startsWith('/leaks/') && path !== '/leaks';

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-400 mb-3 no-print">
      <Link to="/dashboard" className="flex items-center hover:text-slate-200 transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>

      {currentItem && currentItem.path !== '/dashboard' && (
        <>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-300 font-medium">{currentItem.label}</span>
        </>
      )}

      {isLeakDetail && (
        <>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <Link to="/leaks" className="hover:text-slate-200 transition-colors">
            Carbon Leaks
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-200 font-medium">Anomaly Diagnostics</span>
        </>
      )}
    </nav>
  );
}
