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
  ShieldAlert,
  LogOut,
  User,
} from 'lucide-react';
import { NAV_ITEMS } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';

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
  const { user, isAdmin, logout } = useAuth();

  const groups = [
    { key: 'primary', label: 'Setup & Baseline' },
    { key: 'analytics', label: 'Emission Intelligence' },
    { key: 'solutions', label: 'Circular Interventions' },
    { key: 'projection', label: 'Simulation & Trajectory' },
    { key: 'intelligence', label: 'Benchmarking & Reports' },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

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
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
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

          {/* Admin Governance Section */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-purple-400 flex items-center justify-between">
              <span>Governance & Controls</span>
              {!isAdmin && <span className="text-[9px] text-slate-500 font-mono">Role Restricted</span>}
            </div>
            <div className="space-y-0.5">
              {isAdmin ? (
                <NavLink
                  to="/admin"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#22182d] text-purple-300 border border-purple-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#181422]'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate">Admin Console</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/90 text-purple-300 border border-purple-800/80">
                    ROOT
                  </span>
                </NavLink>
              ) : (
                <Link
                  to="/login"
                  onClick={onClose}
                  title="Sign in as System Admin (admin@circuleak.com) to access Governance Controls"
                  className="flex items-center justify-between px-3 py-2 rounded text-xs font-medium text-slate-400 hover:text-purple-300 hover:bg-[#181422] transition-colors group border border-transparent hover:border-purple-800/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldAlert className="w-4 h-4 text-slate-500 group-hover:text-purple-400 shrink-0" />
                    <span className="truncate">Admin Console</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-purple-400 border border-purple-900/60 group-hover:bg-purple-950">
                    Admin Login
                  </span>
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* User Profile & Footer */}
        <div className="p-3 border-t border-[#1e2533] bg-[#0b0e14] space-y-2.5">
          {user && (
            <div className="p-2.5 rounded bg-[#131722] border border-[#1f2738] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {getInitials(user.full_name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate leading-tight">
                      {user.full_name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 truncate">
                      <span className={user.role === 'admin' ? 'text-purple-400 font-semibold' : 'text-emerald-400'}>
                        {user.role === 'admin' ? 'System Admin' : 'Facility Mgr'}
                      </span>
                      {user.facility_id && <span>• F#{user.facility_id}</span>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Log Out Session"
                  className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-1.5 border-t border-[#1a2130] flex items-center justify-between text-[10px] font-mono">
                {user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    onClick={onClose}
                    className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                  >
                    <span>Admin Console Active</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={logout}
                    className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                  >
                    <span>Switch to Admin Account &rarr;</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
            <span>FastAPI Bridge</span>
            <span className="text-emerald-400 font-semibold">v2.4 Live</span>
          </div>
        </div>
      </aside>
    </>
  );
}
