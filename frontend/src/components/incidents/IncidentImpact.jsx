import React from 'react';
import { Leaf, Zap, IndianRupee, Info, ShieldCheck } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';

export function IncidentImpact({ impact }) {
  if (!impact) {
    return (
      <SectionCard
        title="INCIDENT IMPACT"
        subtitle="Quantified carbon, energy, and financial consequences"
        className="mb-6"
      >
        <div className="p-6 text-center text-xs font-mono text-slate-500 bg-[#121622] rounded-lg border border-[#1e2536]">
          Not available from current data
        </div>
      </SectionCard>
    );
  }

  const hasCarbon = impact.carbon_impact_kg !== undefined && impact.carbon_impact_kg !== null;
  const hasEnergy = impact.energy_impact_kwh !== undefined && impact.energy_impact_kwh !== null;
  const hasFinancial = impact.financial_impact_inr !== undefined && impact.financial_impact_inr !== null;

  const prov = impact.emission_factor_provenance;

  return (
    <SectionCard
      title="INCIDENT IMPACT"
      subtitle="Defensibly derived carbon, energy, and financial metrics based on backend telemetry"
      className="mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Carbon Impact */}
        <div className="p-5 rounded-lg bg-[#141824] border border-[#222b3e] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-mono text-[11px]">Carbon Impact</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mb-1">
            {hasCarbon ? (
              impact.carbon_impact_kg >= 1000 ? (
                <>
                  {(impact.carbon_impact_kg / 1000).toFixed(3)}{' '}
                  <span className="text-xs font-normal text-slate-400">tCO₂e</span>
                </>
              ) : (
                <>
                  {impact.carbon_impact_kg.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-400">kgCO₂e</span>
                </>
              )
            ) : (
              <span className="text-xs font-normal text-slate-500">Not available from current data</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 text-[10px] uppercase font-mono mr-1.5">
              Estimated
            </span>
            <span>Excess emissions from deviation</span>
          </div>
        </div>

        {/* Energy Impact */}
        <div className="p-5 rounded-lg bg-[#141824] border border-[#222b3e]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-mono text-[11px]">Excess Energy Load</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mb-1">
            {hasEnergy ? (
              <>
                {impact.energy_impact_kwh.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">kWh</span>
              </>
            ) : (
              <span className="text-xs font-normal text-slate-500">Not available from current data</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            <span className="inline-block px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-900/60 text-[10px] uppercase font-mono mr-1.5">
              Measured / Derived
            </span>
            <span>Unnecessary electrical consumption</span>
          </div>
        </div>

        {/* Financial Impact */}
        <div className="p-5 rounded-lg bg-[#141824] border border-[#222b3e]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-mono text-[11px]">Financial Exposure</span>
            <IndianRupee className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 mb-1">
            {hasFinancial ? (
              <>
                ₹{impact.financial_impact_inr.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">INR</span>
              </>
            ) : (
              <span className="text-xs font-normal text-slate-500">Not available from current data</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            <span className="inline-block px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-900/60 text-[10px] uppercase font-mono mr-1.5">
              Estimated
            </span>
            <span className="truncate">{impact.financial_status || 'Based on standard industrial tariff'}</span>
          </div>
        </div>
      </div>

      {/* Emission Factor Provenance Footer */}
      {prov && (
        <div className="p-3 rounded-lg bg-[#0e121a] border border-[#1b2230] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Emission Factor Provenance:{' '}
              <strong className="text-slate-200">{prov.factor_value} {prov.unit}</strong>{' '}
              ({prov.reference} • v{prov.version})
            </span>
          </div>
          <div className="text-slate-500">
            Calculation: <span className="text-slate-300">{impact.carbon_calculation_method}</span>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
