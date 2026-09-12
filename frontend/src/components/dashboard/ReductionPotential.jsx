import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, CheckCircle2, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { useFacilityContext } from '../../context/FacilityContext';
import { getRecommendations } from '../../services/recommendationsApi';

export function ReductionPotential() {
  const { currentFacilityId } = useFacilityContext();
  const [recsData, setRecsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRecs = async () => {
      if (!currentFacilityId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await getRecommendations(currentFacilityId);
        if (isMounted) setRecsData(res.data);
      } catch {
        if (isMounted) setRecsData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRecs();
    return () => {
      isMounted = false;
    };
  }, [currentFacilityId]);

  const rawList = Array.isArray(recsData) ? recsData : (recsData?.items || recsData?.recommendations || []);
  const items = rawList.map((item) => ({
    ...item,
    co2_reduction: item.co2_reduction ?? item.estimated_co2_reduction_annual_kg ?? 0,
    investment: item.investment ?? item.estimated_cost_inr ?? 0,
    annual_savings: item.annual_savings ?? item.annual_savings_inr ?? 0,
    payback_years: item.payback_years ?? item.payback_period_years ?? 0,
    target_equipment: item.target_equipment || 'Facility Asset',
  }));
  const hasData = items.length > 0;
  const topQuickWin = items[0] || null;

  if (loading) {
    return (
      <SectionCard title="Circular Solutions & Capital ROI Center">
        <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-mono">
          Evaluating circular engineering packages...
        </div>
      </SectionCard>
    );
  }

  if (!hasData) {
    return (
      <SectionCard
        title="Circular Solutions & Capital ROI Center"
        subtitle="Ranked circular interventions formulated to eliminate carbon leaks and optimize thermal recovery"
        className="h-full flex flex-col justify-between"
      >
        <div className="h-44 border border-dashed border-[#232c3d] rounded-lg flex flex-col items-center justify-center text-center p-6 bg-[#0f1219]/60">
          <Cpu className="w-8 h-8 text-slate-600 mb-2" />
          <h5 className="text-xs font-semibold text-slate-300">No Circular Solutions Formulated</h5>
          <p className="text-[11px] text-slate-500 max-w-sm mt-1">
            Intervention packages and capital breakeven projections will generate dynamically once equipment telemetry has been uploaded.
          </p>
        </div>
      </SectionCard>
    );
  }

  const totalCapex = recsData?.total_investment || items.reduce((s, i) => s + (i.investment || 0), 0);
  const totalSavings = recsData?.total_annual_savings || items.reduce((s, i) => s + (i.annual_savings || 0), 0);
  const totalCo2 = recsData?.potential_co2_reduction_total || items.reduce((s, i) => s + (i.co2_reduction || 0), 0);
  const overallPayback = totalSavings > 0 ? Number((totalCapex / totalSavings).toFixed(2)) : 0;

  return (
    <SectionCard
      title="Circular Solutions & Capital ROI Center"
      subtitle="Ranked circular interventions formulated to eliminate carbon leaks and optimize thermal recovery"
      className="h-full flex flex-col"
      badge={
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
          {items.length} Actionable {items.length === 1 ? 'Package' : 'Packages'}
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
        {/* Top Highlight: Immediate Win */}
        {topQuickWin && (
          <div className="p-3.5 rounded-lg bg-gradient-to-r from-[#141b25] to-[#12161f] border border-emerald-900/60 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                    Top Priority Quick Win ({topQuickWin.phase || 'Phase 1'})
                  </span>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {topQuickWin.title}
                  </h4>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Target: <strong className="text-slate-200">{topQuickWin.target_equipment}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2.5 border-y border-[#1e2637] text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Daily CO₂ Cut</span>
                <span className="text-emerald-400 font-bold text-sm block">
                  -{Math.round(topQuickWin.co2_reduction / 365)} kg
                </span>
                <span className="text-[10px] text-slate-500">Avoidable bleed</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Capital Outlay</span>
                <span className="text-slate-100 font-bold text-sm block">
                  {formatCurrency(topQuickWin.investment)}
                </span>
                <span className="text-[10px] text-slate-500">Capex</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Annual Savings</span>
                <span className="text-emerald-400 font-bold text-sm block">
                  {formatCurrency(topQuickWin.annual_savings)}
                </span>
                <span className="text-[10px] text-slate-500">OPEX cut / yr</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Breakeven</span>
                <span className="text-white font-bold text-sm block">
                  {topQuickWin.payback_years} years
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">Estimated payback</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-md">{topQuickWin.why_recommended}</span>
              </div>
              <Link to="/simulation">
                <span className="text-emerald-400 hover:text-emerald-300 text-[11px] font-medium inline-flex items-center gap-1">
                  Model in Simulator →
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* Portfolio Table */}
        <div className="overflow-x-auto rounded-lg border border-[#1e2637] bg-[#121620]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1f2638] bg-[#10141d] text-slate-400 font-mono text-[10px] uppercase">
                <th className="py-2 px-3 font-medium">Intervention Package</th>
                <th className="py-2 px-3 font-medium text-right">Capex</th>
                <th className="py-2 px-3 font-medium text-right">Annual Savings</th>
                <th className="py-2 px-3 font-medium text-right">Payback</th>
                <th className="py-2 px-3 font-medium text-right">Annual CO₂ Cut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2230] font-mono text-[11px]">
              {items.slice(0, 4).map((pkg) => (
                <tr key={pkg.id} className="hover:bg-[#161c28] transition-colors">
                  <td className="py-2 px-3 font-sans">
                    <div className="font-semibold text-slate-200">{pkg.title}</div>
                    <div className="text-[10px] font-mono text-slate-400">Target: {pkg.target_equipment}</div>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-300">
                    {formatCurrency(pkg.investment)}
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-semibold">
                    {formatCurrency(pkg.annual_savings)}/yr
                  </td>
                  <td className="py-2 px-3 text-right text-white font-semibold">
                    {pkg.payback_years} yr
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-semibold">
                    -{Math.round(pkg.co2_reduction).toLocaleString()} kg
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
                Combined Portfolio Impact ({items.length} Packages)
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Capex: <strong className="text-white">{formatCurrency(totalCapex)}</strong> • Savings:{' '}
                <strong className="text-emerald-400">{formatCurrency(totalSavings)}/yr</strong> • Combined Payback:{' '}
                <strong className="text-white">{overallPayback} Years</strong> • Total CO₂ Abatement:{' '}
                <strong className="text-emerald-400">-{Math.round(totalCo2).toLocaleString()} kg/yr</strong>
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
