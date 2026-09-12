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
import { useFacilityContext } from '../../context/FacilityContext';
import { UploadCloud } from 'lucide-react';

export function DashboardOverview({ data }) {
  const { facilityName, currentFacilityId } = useFacilityContext();
  if (!data) return null;

  const isZeroRecords = !data.metrics?.total_emissions || data.metrics.total_emissions === 0;

  return (
    <div className="space-y-6">
      {/* Onboarding Ingestion Banner for Empty / New Facilities */}
      {isZeroRecords && (
        <div className="p-5 rounded-lg bg-gradient-to-r from-emerald-950/60 via-[#111e1c] to-[#121620] border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Ready to Ingest Telemetry for {facilityName}
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  Awaiting Telemetry
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Your facility is active in PostgreSQL. Upload your operational telemetry CSV (energy consumption, fuel inputs, and production volumes) to dynamically trigger carbon footprint computation, detect carbon leaks, and calculate circularity indexes.
              </p>
            </div>
          </div>

          <Link to="/data-upload" className="shrink-0">
            <Button variant="primary" size="md" icon={UploadCloud}>
              Upload Telemetry CSV
            </Button>
          </Link>
        </div>
      )}

      {/* 1. Executive Industrial Operational Health Bar */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-[#141a24] via-[#121620] to-[#151a24] border border-[#232c3d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1a2232] border border-[#2c374d] flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                {facilityName}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Facility ID: {currentFacilityId}
              </span>
              {isZeroRecords ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  0 Records Ingested
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-semibold animate-pulse">
                  Active Leak Detected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Current Operating Shift: Active Telemetry
              </span>
              <span>• Industrial Corridor Database</span>
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
          <EmissionBreakdown sources={data.emission_sources} intensity={data.metrics?.emissions_intensity} />
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
              Carbon Leak Registry
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {data.anomalies_summary?.active_anomalies > 0
                ? `${data.anomalies_summary.active_anomalies} flagged equipment anomalies →`
                : 'No active anomalies detected →'}
            </span>
          </Link>

          <Link
            to="/leaks"
            className="p-3 rounded bg-[#151923] border border-[#222938] hover:border-amber-600/60 transition-colors group"
          >
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block mb-1">
              2. WHY were they flagged?
            </span>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-white block">
              Anomaly Diagnostics
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {data.top_hotspots?.[0]?.equipment
                ? `${data.top_hotspots[0].equipment} (${data.top_hotspots[0].share_percent}% share) →`
                : 'Root-cause baseline deviation →'}
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
              Circular Interventions
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {data.top_recommended_action?.title
                ? `${data.top_recommended_action.title} →`
                : 'Costed engineering alternatives →'}
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
              {data.top_recommended_action?.annual_savings
                ? `₹${(data.top_recommended_action.annual_savings / 100000).toFixed(1)}L/yr savings (${data.top_recommended_action.payback_years} yr payback) →`
                : 'Model intervention bundles →'}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
