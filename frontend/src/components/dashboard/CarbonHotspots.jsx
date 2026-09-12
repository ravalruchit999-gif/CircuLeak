import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Gauge } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';
import { StatusBadge } from '../ui/StatusBadge';

export function CarbonHotspots({ hotspots = [] }) {
  const safeHotspots = Array.isArray(hotspots) ? hotspots : [];
  const cumulativeEmissions = safeHotspots.reduce(
    (acc, item) => acc + Number(item.daily_emissions || item.emissions || 0),
    0
  );

  return (
    <SectionCard
      title="Facility Carbon Hotspots & Asset Telemetry"
      subtitle="Ranked machinery generating primary plant footprint with real-time operational load status"
      className="h-full flex flex-col"
      action={
        <Link
          to="/leaks"
          className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-medium"
        >
          View Leak Registry <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="overflow-x-auto flex-1 flex flex-col justify-between">
        {safeHotspots.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <p className="text-xs text-slate-300 font-medium">No hotspot assets detected</p>
            <p className="text-[11px] text-slate-500 mt-1">Upload operational machine telemetry to identify major carbon drivers.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#202738] text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-medium">Rank & Equipment</th>
                <th className="pb-3 font-medium">Process Area</th>
                <th className="pb-3 font-medium">Emissions Contribution</th>
                <th className="pb-3 font-medium text-right">Operational State</th>
                <th className="pb-3 font-medium text-right">Diagnostics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181e2b]">
              {safeHotspots.map((item, index) => {
                const rank = item.rank || index + 1;
                const eqName = item.equipment || `Asset #${rank}`;
                const emissionsVal = Number(item.daily_emissions ?? item.emissions ?? 0);
                const sharePct = Number(item.share_percent || 0);

                return (
                  <tr
                    key={`${eqName}-${rank}`}
                    className="hover:bg-[#161c28] transition-colors group"
                  >
                    <td className="py-2.5 pr-3 font-medium text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center shrink-0">
                          #{rank}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors block">
                            {eqName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Telemetry ID: {eqName.replace(/\s+/g, '-').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 text-slate-400 pr-3">{item.process || 'General Plant'}</td>

                    <td className="py-2.5 pr-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-100 font-semibold">
                            {emissionsVal.toLocaleString()} kgCO₂e
                          </span>
                          <span className="text-slate-400">{sharePct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#1e2533] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sharePct > 30
                                ? 'bg-amber-500'
                                : sharePct > 18
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, sharePct))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 text-right">
                      <StatusBadge status={item.status || 'NORMAL'} />
                    </td>

                    <td className="py-2.5 text-right">
                      <Link
                        to="/leaks"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        Diagnose <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="mt-3 pt-2.5 border-t border-[#1c2331] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{safeHotspots.length} Core Assets Identified</span>
          <span>Cumulative: {cumulativeEmissions.toLocaleString()} kgCO₂e/day</span>
        </div>
      </div>
    </SectionCard>
  );
}
