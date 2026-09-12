import React from 'react';
import { Menu, Database, Radio, Building, AlertCircle } from 'lucide-react';
import { useFacilityContext } from '../../context/FacilityContext';

export function Topbar({ onToggleSidebar }) {
  const { currentFacilityId, facilityName, isMockMode, toggleMockMode, liveApiError } =
    useFacilityContext();

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
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {currentFacilityId}
              </span>
            </div>
            <span className="hidden sm:inline text-[11px] text-slate-400">
              Vadodara Plant • Alloy & Steel Fabrication
            </span>
          </div>
        </div>
      </div>

      {/* Right: Operational Stats & Demo Mode Indicator */}
      <div className="flex items-center gap-3">
        {/* Core Baseline Stats */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono pr-3 border-r border-[#202737]">
          <div>
            <span className="text-slate-400 text-[10px] block">DAILY EMISSIONS</span>
            <span className="text-slate-200 font-semibold">12,450 kgCO₂e</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">INTENSITY</span>
            <span className="text-slate-200 font-semibold">101 kgCO₂e / t</span>
          </div>
        </div>

        {/* Live API Error Warning (if any) */}
        {liveApiError && !isMockMode && (
          <div className="flex items-center gap-1.5 text-xs text-red-400 px-2.5 py-1 rounded bg-red-950/60 border border-red-800/80">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Backend Offline</span>
          </div>
        )}

        {/* Demo Mode vs Live API Status Pill with interactive toggle */}
        <button
          onClick={() => toggleMockMode()}
          title="Click to toggle between Demo Mock Data and Live FastAPI"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition-all duration-150 border cursor-pointer ${
            isMockMode
              ? 'bg-amber-950/40 text-amber-300 border-amber-800/80 hover:bg-amber-900/40'
              : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/40'
          }`}
        >
          {isMockMode ? (
            <>
              <Database className="w-3 h-3 text-amber-400" />
              <span>Demo Data</span>
            </>
          ) : (
            <>
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Live API</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
