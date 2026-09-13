import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Sliders,
  FileText,
  X,
  Layers,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Activity,
  Building2,
  FileSpreadsheet,
  History,
  Award,
  ArrowRight,
} from 'lucide-react';
import { PRIMARY_HUBS } from '../../constants/navigation';
import { useAuth } from '../../context/AuthContext';

const ICON_MAP = {
  LayoutDashboard,
  AlertTriangle,
  Sliders,
  FileText,
};

const ADMIN_MODULES = [
  {
    id: 'overview',
    label: 'Facilities & Users',
    tab: 'overview',
    path: '/admin?tab=overview',
    icon: Building2,
    tag: 'TENANT DIRECTORY',
    subItems: [
      { label: 'Facilities Directory', tab: 'overview' },
      { label: 'User Accounts', tab: 'overview' },
      { label: 'Conversion Master', tab: 'overview' },
    ],
  },
  {
    id: 'uploads',
    label: 'Ingestion History',
    tab: 'uploads',
    path: '/admin?tab=uploads',
    icon: FileSpreadsheet,
    tag: 'TELEMETRY BATCHES',
    subItems: [
      { label: 'Ingestion Logs', tab: 'uploads' },
      { label: 'Quality Confidence', tab: 'uploads' },
    ],
  },
  {
    id: 'audit_logs',
    label: 'Platform Audit Trail',
    tab: 'audit_logs',
    path: '/admin?tab=audit_logs',
    icon: History,
    tag: 'SECURITY LOGS',
    subItems: [
      { label: 'System Actions', tab: 'audit_logs' },
      { label: 'Immutable Ledger', tab: 'audit_logs' },
    ],
  },
  {
    id: 'benchmarks',
    label: 'Sector Benchmarks',
    tab: 'benchmarks',
    path: '/admin?tab=benchmarks',
    icon: Award,
    tag: 'REGULATORY STANDARDS',
    subItems: [
      { label: 'CCTS Thresholds', tab: 'benchmarks' },
      { label: 'BEE Baselines', tab: 'benchmarks' },
    ],
  },
];

export function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const currentAdminTab = new URLSearchParams(location.search).get('tab') || 'overview';

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const isHubActive = (hub) => {
    if (location.pathname === hub.path) return true;
    if (hub.subItems && hub.subItems.some((sub) => location.pathname.startsWith(sub.path))) {
      return true;
    }
    return false;
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
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0e1117] border-r border-[#1e2533] flex flex-col transition-transform duration-200 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } no-print`}
      >
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-[#1e2533] flex items-center justify-between">
          <Link
            to={isAdminRoute ? '/admin' : '/dashboard'}
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <div
              className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold tracking-wider shadow-sm ${
                isAdminRoute
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-800'
                  : 'bg-gradient-to-br from-emerald-600 to-teal-800'
              }`}
            >
              {isAdminRoute ? <ShieldAlert className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-none">
                CircuLeak
              </span>
              <span
                className={`text-[10px] uppercase font-mono tracking-wider font-semibold ${
                  isAdminRoute ? 'text-purple-400' : 'text-slate-400'
                }`}
              >
                {isAdminRoute ? 'Platform Admin' : 'Carbon Intelligence'}
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded text-slate-400 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Content: Mode-Aware */}
        {isAdminRoute ? (
          /* ADMIN GOVERNANCE NAVIGATION */
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
            <div className="px-3 text-[10px] font-mono uppercase tracking-widest text-purple-400 flex items-center justify-between">
              <span>Governance Console</span>
              <span className="text-[9px] text-purple-300 font-mono">4 Modules</span>
            </div>

            <div className="space-y-2">
              {ADMIN_MODULES.map((mod) => {
                const Icon = mod.icon;
                const active = currentAdminTab === mod.tab;

                return (
                  <div
                    key={mod.id}
                    className={`rounded-lg border transition-all duration-150 ${
                      active
                        ? 'bg-[#1f172a] border-purple-500/50 shadow-sm shadow-purple-950/20'
                        : 'bg-[#10141e]/70 border-transparent hover:border-[#1e273a] hover:bg-[#141824]'
                    }`}
                  >
                    <Link
                      to={mod.path}
                      onClick={onClose}
                      className="flex items-start p-2.5 group"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div
                          className={`p-1.5 rounded mt-0.5 shrink-0 ${
                            active
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-[#171e2c] text-slate-400 group-hover:text-slate-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              className={`text-xs font-semibold leading-tight break-words ${
                                active ? 'text-purple-200' : 'text-slate-300 group-hover:text-white'
                              }`}
                            >
                              {mod.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-mono text-slate-400">
                              {mod.tag}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Sub-view Chips */}
                    {mod.subItems && (
                      <div className="px-2 pb-2 pt-0.5 border-t border-[#231a33]/60 flex flex-wrap items-center gap-1">
                        {mod.subItems.map((sub, idx) => {
                          const isSubActive = active;
                          return (
                            <Link
                              key={idx}
                              to={`/admin?tab=${sub.tab}`}
                              onClick={onClose}
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors whitespace-nowrap ${
                                isSubActive
                                  ? 'bg-purple-950/70 text-purple-300 border border-purple-800/60 font-semibold'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                              }`}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Exit to Plant Workspace */}
            <div className="pt-3 border-t border-[#1e2533]">
              <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center justify-between">
                <span>Operational Mode</span>
                <span className="text-[9px] text-emerald-400 font-mono">Factory</span>
              </div>
              <Link
                to="/dashboard"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-emerald-300 bg-[#121c1f] border border-emerald-800/60 hover:bg-[#162529] hover:border-emerald-700 transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <LayoutDashboard className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block font-semibold">Enter Plant Workspace</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Inspect Active Telemetry</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            </div>
          </nav>
        ) : (
          /* STANDARD FACILITY OPERATIONAL HUBS NAVIGATION */
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
            <div className="px-3 text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center justify-between">
              <span>Core Workspaces</span>
              <span className="text-[9px] text-emerald-400 font-mono">4 Hubs</span>
            </div>

            <div className="space-y-2">
              {PRIMARY_HUBS.map((hub) => {
                const Icon = ICON_MAP[hub.iconName] || Activity;
                const active = isHubActive(hub);

                return (
                  <div
                    key={hub.id}
                    className={`rounded-lg border transition-all duration-150 ${active
                      ? 'bg-[#151c28] border-emerald-500/40 shadow-sm shadow-emerald-950/20'
                      : 'bg-[#10141e]/70 border-transparent hover:border-[#1e273a] hover:bg-[#141824]'
                      }`}
                  >
                    <NavLink
                      to={hub.path}
                      onClick={onClose}
                      className="flex items-start p-2.5 group"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div
                          className={`p-1.5 rounded mt-0.5 shrink-0 ${active
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#171e2c] text-slate-400 group-hover:text-slate-200'
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              className={`text-xs font-semibold leading-tight break-words ${active ? 'text-emerald-300' : 'text-slate-300 group-hover:text-white'
                                }`}
                            >
                              {hub.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-mono text-slate-400">
                              {hub.tag}
                            </span>
                            {hub.badge && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-950/80 text-red-300 border border-red-800/80 shrink-0">
                                {hub.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </NavLink>

                    {/* Sub-view Chips when active or on desktop */}
                    {hub.subItems && (
                      <div className="px-2 pb-2 pt-0.5 border-t border-[#182133]/60 flex flex-wrap items-center gap-1">
                        {hub.subItems.map((sub) => {
                          const isSubActive = location.pathname === sub.path;
                          return (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              onClick={onClose}
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors whitespace-nowrap ${isSubActive
                                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 font-semibold'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                }`}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Admin Governance Section (STRICTLY rendered for verified Admin role only) */}
            {isAdmin && (
              <div className="pt-2 border-t border-[#1e2533]">
                <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-purple-400 flex items-center justify-between">
                  <span>System Administration</span>
                  <span className="text-[9px] text-purple-400 font-mono">Super-User</span>
                </div>
                <NavLink
                  to="/admin"
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 rounded text-xs font-medium text-purple-300 bg-purple-950/40 border border-purple-800/70 hover:bg-purple-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate font-semibold">Admin Governance</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    ROOT
                  </span>
                </NavLink>
              </div>
            )}
          </nav>
        )}

        {/* User Profile & Session Footer */}
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

              {/* Admin shortcut (ONLY if user is verified admin) */}
              {user.role === 'admin' && (
                <div className="pt-1.5 border-t border-[#1a2130] flex items-center justify-between text-[10px] font-mono">
                  <Link
                    to="/admin"
                    onClick={onClose}
                    className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                  >
                    <span>Open Admin Console &rarr;</span>
                  </Link>
                </div>
              )}
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
