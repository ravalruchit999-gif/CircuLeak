import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, CheckCircle2, ArrowRight, ShieldCheck, TrendingDown } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';
import { Button } from '../ui/Button';
import { formatCurrency, formatPayback } from '../../utils/formatters';

const portfolioPackages = [
  {
    id: 'REC-01',
    name: 'Compressor Off-Hours Sequencing & Unloader',
    target: 'Compressor 03',
    capex: 80000,
    annualSavings: 160000,
    payback: '0.50 yr',
    co2Cut: '-950 kg/d',
    status: 'Immediate (Phase 1)',
  },
  {
    id: 'REC-02',
    name: 'Furnace Recuperator Waste Heat Preheating',
    target: 'Furnace Line 2',
    capex: 250000,
    annualSavings: 120000,
    payback: '2.08 yr',
    co2Cut: '-1150 kg/d',
    status: 'Phase 2',
  },
  {
    id: 'REC-03',
    name: 'Cooling Tower Pump VFD & Dynamic Interlock',
    target: 'Cooling Tower 01',
    capex: 120000,
    annualSavings: 60000,
    payback: '2.00 yr',
    co2Cut: '-450 kg/d',
    status: 'Phase 2',
  },
  {
    id: 'REC-04',
    name: '200 kWp Rooftop Solar PV Integration',
    target: 'Plant Rooftop Shed',
    capex: 200000,
    annualSavings: 80000,
    payback: '2.50 yr',
    co2Cut: '-600 kg/d',
    status: 'Phase 3',
  },
];

export function ReductionPotential({ recommendation }) {
  return (
    <SectionCard
      title="Circular Solutions & Capital ROI Center"
      subtitle="Ranked circular interventions formulated to eliminate carbon leaks and optimize thermal recovery"
      className="h-full flex flex-col"
      badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
          High Financial Yield
        </span>
      }
      action={
        <Link
          to="/recommendations"
          className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-medium"
        >
          View All Packages <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-4 flex flex-col justify-between h-full">
        {/* Top Highlight: Immediate Win for Compressor 03 */}
        <div className="p-3.5 rounded-lg bg-gradient-to-r from-[#141b25] to-[#12161f] border border-emerald-900/60 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                  Top Priority Quick Win (Phase 1)
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Compressor Off-Hours Sequencing & Unloader Repair
                </h4>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Target: <strong className="text-slate-200">Compressor 03</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2.5 border-y border-[#1e2637] text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Daily CO₂ Cut</span>
              <span className="text-emerald-400 font-bold text-sm block">-950 kg</span>
              <span className="text-[10px] text-slate-500">Avoidable bleed</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Capital Outlay</span>
              <span className="text-slate-100 font-bold text-sm block">₹80,000</span>
              <span className="text-[10px] text-slate-500">One-time Capex</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Annual Savings</span>
              <span className="text-emerald-400 font-bold text-sm block">₹1,60,000</span>
              <span className="text-[10px] text-slate-500">OPEX cut / year</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Breakeven</span>
              <span className="text-white font-bold text-sm block">0.50 years</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Under 6 months</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Fixes unloader valve erosion & installs off-hours interlock</span>
            </div>
            <Link to="/simulation">
              <span className="text-emerald-400 hover:text-emerald-300 text-[11px] font-medium inline-flex items-center gap-1">
                Model in Simulator →
              </span>
            </Link>
          </div>
        </div>

        {/* 4-Package Portfolio Table */}
        <div className="overflow-x-auto rounded-lg border border-[#1e2637] bg-[#121620]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1f2638] bg-[#10141d] text-slate-400 font-mono text-[10px] uppercase">
                <th className="py-2 px-3 font-medium">Intervention Package</th>
                <th className="py-2 px-3 font-medium text-right">Capex</th>
                <th className="py-2 px-3 font-medium text-right">Annual OPEX Cut</th>
                <th className="py-2 px-3 font-medium text-right">Payback</th>
                <th className="py-2 px-3 font-medium text-right">CO₂ Cut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2230] font-mono text-[11px]">
              {portfolioPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-[#161c28] transition-colors">
                  <td className="py-2 px-3 font-sans">
                    <div className="font-semibold text-slate-200">{pkg.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">Target: {pkg.target}</div>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-300">
                    {formatCurrency(pkg.capex)}
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-semibold">
                    {formatCurrency(pkg.annualSavings)}/yr
                  </td>
                  <td className="py-2 px-3 text-right text-white font-semibold">
                    {pkg.payback}
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-semibold">
                    {pkg.co2Cut}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Combined Portfolio Totals Footer */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-[#121822] via-[#10151d] to-[#141a24] border border-[#232c3d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-slate-200 font-semibold">
                Combined 4-Package Portfolio Impact
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Capex: <strong className="text-white">₹6,50,000</strong> • Savings: <strong className="text-emerald-400">₹4,20,000/yr</strong> • Combined Payback: <strong className="text-white">1.55 Years</strong> • Abatement: <strong className="text-emerald-400">-3,150 kg/d (-25.3%)</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/action-planner">
              <Button variant="secondary" size="sm" icon={ArrowRight}>
                Action Planner
              </Button>
            </Link>
            <Link to="/simulation">
              <Button variant="primary" size="sm" icon={Sparkles}>
                Simulate
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
