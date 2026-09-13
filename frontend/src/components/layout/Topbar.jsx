import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Building, AlertCircle, CheckCircle2, Activity, ShieldAlert, Sun, Moon } from 'lucide-react';
import { useFacilityContext } from '../../context/FacilityContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export function Topbar({ onToggleSidebar }) {
  const { currentFacilityId, facilityName, facilityDetails, facilityMetrics, liveApiError } =
    useFacilityContext();
  const { isAdmin } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const totalEmissions = facilityMetrics?.total_emissions;
  const intensity = facilityMetrics?.emissions_intensity;
  const hasTelemetry = typeof totalEmissions === 'number' && totalEmissions > 0;

  const subtitle = facilityDetails?.location && facilityDetails?.sector
    ? `${facilityDetails.location} • ${facilityDetails.sector}`
    : (facilityDetails?.sector || 'Industrial Decarbonization Platform');

  return (
    <header className="sticky top-0 z-30 h-14 bg-[#0f1219]/95 backdrop-blur-sm border-b border-[#1f2635] px-4 lg:px-6 flex items-center justify-between no-print">
      {/* Left: Mobile trigger & Active Facility */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#18202d] border border-[#273245] flex items-center justify-center text-slate-300">
            <Building className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200 tracking-tight truncate max-w-[200px] sm:max-w-xs">
                {facilityName}
              </span>
              {currentFacilityId && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  ID: {currentFacilityId}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-[11px] text-slate-400 truncate max-w-sm block">
              {subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Operational Stats & Live System Status */}
      <div className="flex items-center gap-3">
        {/* Core Baseline Stats - Dynamic */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono pr-3 border-r border-[#202737]">
          <div>
            <span className="text-slate-400 text-[10px] block">DAILY EMISSIONS</span>
            <span className="text-slate-200 font-semibold">
              {hasTelemetry ? `${Math.round(totalEmissions).toLocaleString()} kgCO₂e` : 'Awaiting Data'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">INTENSITY</span>
            <span className="text-slate-200 font-semibold">
              {hasTelemetry && intensity ? `${intensity} kgCO₂e / t` : '—'}
            </span>
          </div>
        </div>

        {/* Live API Error Warning (if any) */}
        {liveApiError ? (
          <div className="flex items-center gap-1.5 text-xs text-red-400 px-2.5 py-1 rounded bg-red-950/60 border border-red-800/80">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Backend Offline</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium border bg-emerald-950/40 text-emerald-300 border-emerald-800/80">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>FastAPI Live</span>
          </div>
        )}

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          type="button"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium border bg-[#171e2c] border-[#29354b] text-slate-200 hover:text-white hover:border-emerald-500/50 hover:bg-[#1f283a] transition-all cursor-pointer shadow-sm active:scale-95"
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span className="hidden sm:inline text-[11px]">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline text-[11px]">Dark</span>
            </>
          )}
        </button>

        {/* Admin Console Shortcut (Only visible to verified Administrators) */}
        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium border bg-purple-950/70 text-purple-300 border-purple-800 hover:bg-purple-900/80 transition-colors shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>&larr; Admin Console</span>
          </Link>
        )}
      </div>
    </header>
  );
}
