import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  UploadCloud,
  Activity,
  AlertTriangle,
  Sparkles,
  ListChecks,
  Sliders,
  TrendingDown,
  BarChart3,
  RefreshCw,
  FileText,
  X,
  Layers,
} from 'lucide-react';
import { NAV_ITEMS } from '../../constants/navigation';

const ICON_MAP = {
  LayoutDashboard,
  Building2,
  UploadCloud,
  Activity,
  AlertTriangle,
  Sparkles,
  ListChecks,
  Sliders,
  TrendingDown,
  BarChart3,
  RefreshCw,
  FileText,
};

export function Sidebar({ isOpen, onClose }) {
  const groups = [
    { key: 'primary', label: 'Setup & Baseline' },
    { key: 'analytics', label: 'Emission Intelligence' },
    { key: 'solutions', label: 'Circular Interventions' },
    { key: 'projection', label: 'Simulation & Trajectory' },
    { key: 'intelligence', label: 'Benchmarking & Reports' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0e1117] border-r border-[#1e2533] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-[#1e2533] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-bold tracking-wider shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-none">
                CircuLeak
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Carbon Intelligence
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Item Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {groups.map((group) => {
            const items = NAV_ITEMS.filter((item) => item.group === group.key);
            if (items.length === 0) return null;

            return (
              <div key={group.key}>
                <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = ICON_MAP[item.iconName] || Activity;
                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-[#18202d] text-emerald-300 border border-emerald-500/30'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-[#141822]'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/80">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-[#1e2533] text-[11px] text-slate-400 bg-[#0b0e14]">
          <div className="flex items-center justify-between font-mono">
            <span>FastAPI Bridge</span>
            <span className="text-emerald-400 font-semibold">v2.4 Ready</span>
          </div>
        </div>
      </aside>
    </>
  );
}
