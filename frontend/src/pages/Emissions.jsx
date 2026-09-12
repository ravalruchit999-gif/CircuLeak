import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { useEmissions } from '../hooks/useEmissions';
import { EmissionOverview } from '../components/emissions/EmissionOverview';
import { EmissionBySource } from '../components/emissions/EmissionBySource';
import { EmissionByProcess } from '../components/emissions/EmissionByProcess';
import { EmissionByEquipment } from '../components/emissions/EmissionByEquipment';
import { EmissionTimeline } from '../components/emissions/EmissionTimeline';
import { EmissionIntensity } from '../components/emissions/EmissionIntensity';

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emission Intelligence & Source Breakdown"
        subtitle="Detailed footprint distribution across Scope 1 direct fuels, electricity carriers, and machinery"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            101 kgCO₂e / ton product
          </span>
        }
      />

      {/* Top Level KPIs */}
      <EmissionOverview data={data} />

      {/* Sources & Processes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmissionBySource sources={data.by_source} />
        <EmissionByProcess processes={data.by_process} />
      </div>

      {/* Machinery Breakdown */}
      <EmissionByEquipment equipment={data.by_equipment} />

      {/* 30-day Temporal Timeline & Intensity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <EmissionTimeline timeline={data.timeline} />
        </div>
        <div className="flex flex-col">
          <EmissionIntensity intensity={data.emission_intensity} />
        </div>
      </div>
    </div>
  );
}
export default Emissions;
