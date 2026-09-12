import React from 'react';
import { Link } from 'react-router-dom';
import { EmissionSummary } from './EmissionSummary';
import { ShiftTelemetryChart } from './ShiftTelemetryChart';
import { CarbonHotspots } from './CarbonHotspots';
import { EmissionBreakdown } from './EmissionBreakdown';
import { AnomalySummary } from './AnomalySummary';
import { ReductionPotential } from './ReductionPotential';
import {
  Building2,
  Clock,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  Sliders,
  TrendingDown,
  BarChart3,
  FileText,
} from 'lucide-react';
import { Button } from '../ui/Button';

export function DashboardOverview({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* 1. Executive Industrial Operational Health Bar */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-[#141a24] via-[#121620] to-[#151a24] border border-[#232c3d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1a2232] border border-[#2c374d] flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Apex Metals & Casting Unit 4
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Continuous Melting • 45k Tonnes/yr
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-semibold animate-pulse">
                Active Leak Detected
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Current Operating Shift: Night (22:00 — 06:00)
              </span>
              <span>• Vadodara Industrial Estate</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/data-upload">
            <Button variant="outline" size="sm">
              Upload New Logs
            </Button>
          </Link>
          <Link to="/audit-report">
            <Button variant="secondary" size="sm" icon={FileText}>
              Audit Memorandum
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top-Level Core Metrics */}
      <EmissionSummary metrics={data.metrics} />

      {/* 3. 24-Hour Diurnal Shift Telemetry & Anomaly Leak Curve */}
      <ShiftTelemetryChart />

      {/* 4. Row A (WHERE & WHY): Hotspots Table (Left) + Active Alerts Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <CarbonHotspots hotspots={data.top_hotspots} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <AnomalySummary anomalies={data.anomalies_summary} />
        </div>
      </div>

      {/* 5. Row B (WHAT & WHAT IF): Circular Solutions ROI (Left) + Energy Carrier Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <ReductionPotential recommendation={data.top_recommended_action} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <EmissionBreakdown sources={data.emission_sources} />
        </div>
      </div>

      {/* 6. Strategic 4-Question Executive Journey Navigation */}
      <div className="p-4 rounded-lg bg-[#11151e] border border-[#202737] text-xs">
        <div className="flex items-center justify-between mb-3 border-b border-[#1d2331] pb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            CircuLeak Executive Decision Journey
          </span>
          <span className="text-slate-400 text-[11px]">Direct navigation across the 4 core questions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/leaks"
            className="p-3 rounded bg-[#151923] border border-[#222938] hover:border-red-600/60 transition-colors group"
          >
            <span className="text-[10px] font-mono text-red-400 font-bold uppercase block mb-1">
              1. WHERE are the leaks?
            </span>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-white block">
              Carbon Leak Points Registry
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              7 flagged equipment anomalies →
            </span>
          </Link>

          <Link
            to="/leaks/LEAK-01"
            className="p-3 rounded bg-[#151923] border border-[#222938] hover:border-amber-600/60 transition-colors group"
          >
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block mb-1">
              2. WHY were they flagged?
            </span>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-white block">
              Compressor 03 Diagnostics
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              +45% off-hours unloader bleed →
            </span>
          </Link>

          <Link
            to="/recommendations"
            className="p-3 rounded bg-[#151923] border border-[#222938] hover:border-emerald-600/60 transition-colors group"
          >
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">
              3. WHAT can fix them?
            </span>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-white block">
              Circular Alternatives
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              4 costed engineering packages →
            </span>
          </Link>

          <Link
            to="/simulation"
            className="p-3 rounded bg-[#151923] border border-[#222938] hover:border-cyan-600/60 transition-colors group"
          >
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block mb-1">
              4. WHAT IF we deploy?
            </span>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-white block">
              What-If Simulator & ROI
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              ₹4.2L/yr savings & 1.55 yr payback →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
