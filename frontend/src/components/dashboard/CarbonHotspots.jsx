import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Gauge } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';
import { StatusBadge } from '../ui/StatusBadge';

export function CarbonHotspots({ hotspots = [] }) {
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
            {hotspots.map((item) => (
              <tr
                key={item.rank}
                className="hover:bg-[#161c28] transition-colors group"
              >
                <td className="py-2.5 pr-3 font-medium text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center shrink-0">
                      #{item.rank}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors block">
                        {item.equipment}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Telemetry ID: {item.equipment.replace(/\s+/g, '-').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-2.5 text-slate-400 pr-3">{item.process}</td>

                <td className="py-2.5 pr-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-100 font-semibold">
                        {item.emissions.toLocaleString()} kgCO₂e
                      </span>
                      <span className="text-slate-400">{item.share_percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#1e2533] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.share_percent > 30
                            ? 'bg-amber-500'
                            : item.share_percent > 18
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${item.share_percent}%` }}
                      />
                    </div>
                  </div>
                </td>

                <td className="py-2.5 text-right">
                  <StatusBadge status={item.status} />
                </td>

                <td className="py-2.5 text-right">
                  <Link
                    to={item.equipment.includes('Compressor') ? '/leaks/LEAK-01' : '/leaks'}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    Diagnose <ArrowRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 pt-2.5 border-t border-[#1c2331] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>5 Core Assets Monitored</span>
          <span>Cumulative: 12,450 kgCO₂e/day (100%)</span>
        </div>
      </div>
    </SectionCard>
  );
}
