import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { useEmissions } from '../hooks/useEmissions';
import { EmissionOverview } from '../components/emissions/EmissionOverview';
import { EmissionBySource } from '../components/emissions/EmissionBySource';
import { EmissionByProcess } from '../components/emissions/EmissionByProcess';
import { EmissionByEquipment } from '../components/emissions/EmissionByEquipment';
import { EmissionTimeline } from '../components/emissions/EmissionTimeline';
import { EmissionIntensity } from '../components/emissions/EmissionIntensity';
import { Flame, UploadCloud } from 'lucide-react';

export function Emissions() {
  const { data, loading, error, refetch } = useEmissions();

  if (loading) {
    return (
      <div>
        <PageHeader title="Plant Emission Intelligence" />
        <LoadingState rows={6} message="Calculating energy carrier factors and process breakdown..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Plant Emission Intelligence" />
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  const hasData = data && (data.total_emissions > 0 || (Array.isArray(data.by_source) && data.by_source.length > 0));

  if (!hasData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Emission Intelligence & Source Breakdown"
          subtitle="Detailed footprint distribution across Scope 1 direct fuels, electricity carriers, and machinery"
        />
        <EmptyState
          icon={Flame}
          title="No Operational Emissions Recorded"
          description="Emission intelligence requires uploaded operational time-series telemetry. Upload energy and fuel consumption logs to compute verified Scope 1 and Scope 2 footprints."
          actionText="Upload Facility Telemetry"
          actionLink="/data-upload"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emission Intelligence & Source Breakdown"
        subtitle="Detailed footprint distribution across Scope 1 direct fuels, electricity carriers, and machinery"
        badge={
          data.emissions_intensity ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {data.emissions_intensity} kgCO₂e / unit
            </span>
          ) : null
        }
      />

      {/* Top Level KPIs */}
      <EmissionOverview data={data} />

      {/* Sources & Processes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmissionBySource sources={data.by_source || []} />
        <EmissionByProcess processes={data.by_process || []} />
      </div>

      {/* Machinery Breakdown */}
      <EmissionByEquipment equipment={data.by_equipment || []} />

      {/* 30-day Temporal Timeline & Intensity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <EmissionTimeline timeline={data.timeline || []} />
        </div>
        <div className="flex flex-col">
          <EmissionIntensity
            intensity={data.emissions_intensity || 0}
            scope1={(data.by_source || [])
              .filter(s => (s.name || '').toLowerCase().includes('scope 1') || (s.name || '').toLowerCase().includes('gas') || (s.name || '').toLowerCase().includes('fuel'))
              .reduce((acc, curr) => acc + (curr.value || 0), 0)}
            scope2={(data.by_source || [])
              .filter(s => (s.name || '').toLowerCase().includes('scope 2') || (s.name || '').toLowerCase().includes('grid') || (s.name || '').toLowerCase().includes('elec'))
              .reduce((acc, curr) => acc + (curr.value || 0), 0)}
          />
        </div>
      </div>
    </div>
  );
}
export default Emissions;
