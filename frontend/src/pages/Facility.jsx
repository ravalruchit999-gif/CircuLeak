import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { useFacility } from '../hooks/useFacility';
import {
  Building2,
  MapPin,
  Users,
  Clock,
  Zap,
  UploadCloud,
  Layers,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

export function Facility() {
  const { facility, loading, error, refetch } = useFacility();

  if (loading) {
    return (
      <div>
        <PageHeader title="Facility Profile & Baseline Setup" />
        <LoadingState rows={5} message="Loading facility parameters..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Facility Profile & Baseline Setup" />
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facility Setup & Equipment Inventory"
        subtitle="Operational parameters, energy carriers, shift schedules, and registered equipment assets"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {facility.facility_id}
          </span>
        }
        actions={
          <Link to="/data-upload">
            <Button variant="primary" size="sm" icon={UploadCloud}>
              Upload Process Data
            </Button>
          </Link>
        }
      />

      {/* Primary Plant Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col">
          <SectionCard title="Enterprise & Operational Profile" className="h-full flex flex-col justify-between">
            <div className="space-y-3 text-xs flex-1 flex flex-col justify-between">
              <div className="flex justify-between py-2 border-b border-[#1f2635]">
                <span className="text-slate-400">Business Name</span>
                <span className="font-semibold text-slate-200">{facility.business_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1f2635]">
                <span className="text-slate-400">Facility / Unit Name</span>
                <span className="font-semibold text-slate-200">{facility.facility_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1f2635]">
                <span className="text-slate-400">Sector</span>
                <span className="font-semibold text-slate-200">{facility.sector}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1f2635]">
                <span className="text-slate-400">Plant Location</span>
                <span className="font-semibold text-slate-200">{facility.location}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1f2635]">
                <span className="text-slate-400">Production Type</span>
                <span className="font-semibold text-slate-200">{facility.production_type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1f2635]">
                <span className="text-slate-400">Annual Production Volume</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {facility.production_volume?.toLocaleString()} {facility.production_volume_unit}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1f2635]">
                <span className="text-slate-400">Workforce Headcount</span>
                <span className="font-mono text-slate-200">{facility.employees} Employees</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Operating Schedule</span>
                <span className="font-mono text-slate-200">{facility.operating_hours}</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Energy Carrier Mix & Substation */}
        <div className="flex flex-col">
          <SectionCard title="Registered Energy Sources & Substation Feed" className="h-full flex flex-col justify-between">
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                {facility.energy_sources?.map((src) => (
                  <div
                    key={src.name}
                    className="p-2.5 rounded bg-[#141822] border border-[#212735] flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 block">{src.name}</span>
                      <span className="text-[10px] text-slate-400">
                        Annual: {src.annual_consumption}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold text-sm block">
                        {src.share_percent}%
                      </span>
                      <span className="text-[10px] text-slate-400">Carrier Share</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-2.5 rounded bg-[#121620] border border-[#1e2535]">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Sanctioned Load</span>
                  <span className="text-slate-200 font-bold">2,500 kVA (66kV)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Industrial Tariff</span>
                  <span className="text-emerald-400 font-bold">HT-1 Industrial</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Gas Pipeline</span>
                  <span className="text-slate-200 font-bold">4.5 bar (GGL)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Submetering</span>
                  <span className="text-slate-200 font-bold">Class 0.2S SCADA</span>
                </div>
              </div>

              <div className="p-2 rounded bg-[#11141b] border border-[#1f2635] text-[11px] text-slate-400">
                Plant operates under industrial time-of-day (TOD) tariff with night concession rate (22:00-06:00).
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Equipment Inventory */}
      <SectionCard
        title="Registered Equipment Inventory"
        subtitle="Assets continuously scanned by CircuLeak anomaly detection algorithms"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#202738] text-slate-400 font-mono uppercase tracking-wider">
                <th className="pb-3 font-medium">Asset ID & Equipment</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Process Area</th>
                <th className="pb-3 font-medium">Commissioned</th>
                <th className="pb-3 font-medium text-right">Condition Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181e2b]">
              {facility.equipment?.map((eq) => (
                <tr key={eq.id} className="hover:bg-[#151a24]/50 transition-colors">
                  <td className="py-3">
                    <span className="font-semibold text-slate-100 block">{eq.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{eq.id}</span>
                  </td>
                  <td className="py-3 text-slate-300">{eq.type}</td>
                  <td className="py-3 text-slate-400">{eq.process}</td>
                  <td className="py-3 font-mono text-slate-400">{eq.installed_year}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                        eq.status === 'flagged_leak'
                          ? 'bg-red-950/80 text-red-300 border-red-800 animate-pulse'
                          : eq.status === 'high_consumption'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {eq.status === 'flagged_leak'
                        ? 'Flagged Critical Leak'
                        : eq.status === 'high_consumption'
                        ? 'High Consumption'
                        : 'Optimal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
export default Facility;
