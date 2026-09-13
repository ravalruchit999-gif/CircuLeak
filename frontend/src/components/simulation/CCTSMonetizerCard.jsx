import React, { useState, useEffect } from 'react';
import { SectionCard } from '../ui/SectionCard';
import {
  Award,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  Layers,
  Info,
  Clock,
  Coins
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useFacilityContext } from '../../context/FacilityContext';
import { getCCTSStatus, monetizeAbatement } from '../../services/cctsApi';

export function CCTSMonetizerCard({
  facilityId,
  simulatedAbatementKg = 0,
  investmentInr = 0,
  annualSavingsInr = 0,
}) {
  const { currentFacilityId } = useFacilityContext();
  const activeFacilityId = facilityId || currentFacilityId;

  const [cctsData, setCctsData] = useState(null);
  const [carbonPrice, setCarbonPrice] = useState(1850);
  const [monetizationImpact, setMonetizationImpact] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch base facility CCTS standing
  useEffect(() => {
    let isMounted = true;
    async function loadStatus() {
      if (!activeFacilityId) return;
      try {
        setLoading(true);
        const res = await getCCTSStatus(activeFacilityId, carbonPrice);
        if (isMounted && res.data) {
          setCctsData(res.data);
        }
      } catch (err) {
        console.error('Failed to load CCTS status:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadStatus();
    return () => {
      isMounted = false;
    };
  }, [activeFacilityId]);

  // Recalculate monetization when abatement, investment, savings, or carbon price change
  useEffect(() => {
    let isMounted = true;
    async function calculateImpact() {
      if (!activeFacilityId) return;
      const abatementTonnes = (simulatedAbatementKg || 0) / 1000.0;
      try {
        const res = await monetizeAbatement({
          facility_id: activeFacilityId,
          abatement_tonnes: abatementTonnes,
          investment_inr: investmentInr || 0,
          annual_savings_inr: annualSavingsInr || 0,
          carbon_price_inr: carbonPrice,
        });
        if (isMounted && res.data && res.data.simulation_impact) {
          setMonetizationImpact(res.data.simulation_impact);
        }
      } catch (err) {
        console.error('Failed to calculate CCTS monetization:', err);
      }
    }
    calculateImpact();
    return () => {
      isMounted = false;
    };
  }, [activeFacilityId, simulatedAbatementKg, investmentInr, annualSavingsInr, carbonPrice]);

  if (loading && !cctsData) {
    return (
      <SectionCard title="BEE Carbon Credit Trading Scheme (CCTS) Monetization">
        <div className="h-32 flex items-center justify-center text-xs text-slate-400 font-mono">
          Calibrating BEE Designated Consumer baselines & ICM trading parameters...
        </div>
      </SectionCard>
    );
  }

  if (!cctsData || !cctsData.has_data) {
    return (
      <SectionCard
        title="BEE Carbon Credit Trading Scheme (CCTS) Monetization"
        subtitle="National Carbon Market monetization under BEE Energy Conservation Act"
      >
        <div className="p-6 text-center text-xs text-slate-400 font-mono space-y-2">
          <p>No operational emissions data available yet to calibrate BEE Designated Consumer baselines.</p>
          <p className="text-slate-500 text-[11px]">Upload operational telemetry to compute tradable CCC certificates and statutory penalty shields.</p>
        </div>
      </SectionCard>
    );
  }

  const isCreditSurplus = cctsData.compliance_status === 'CREDIT_SURPLUS';
  const tradableCCC = monetizationImpact?.tradable_ccc_earned ?? cctsData.current_ccc_earned ?? 0;
  const carbonRevenue = monetizationImpact?.annual_carbon_revenue_inr ?? cctsData.current_ccc_revenue_inr ?? 0;
  const standardPayback = monetizationImpact?.standard_payback_years ?? 0;
  const acceleratedPayback = monetizationImpact?.accelerated_payback_years ?? 0;
  const speedupPct = monetizationImpact?.payback_speedup_percent ?? 0;
  const penaltyAvoided = monetizationImpact?.penalty_avoided_inr ?? 0;

  return (
    <SectionCard
      title="BEE Carbon Credit Trading Scheme (CCTS) Monetization"
      subtitle={`National Carbon Market monetization under ${cctsData.regulation_code || 'BEE Energy Conservation Act'}`}
      badge={
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono border ${
          isCreditSurplus
            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
            : 'bg-amber-950/80 border-amber-800 text-amber-300'
        }`}>
          {isCreditSurplus ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
          <span>{isCreditSurplus ? 'BEE Baseline Compliant' : 'Shortfall Deficit Liability'}</span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top KPI Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Tradable CCC Certificates */}
          <div className="p-3.5 rounded-lg bg-[#141822] border border-[#212735] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Tradable CCCs
              </div>
              <div className="text-lg font-bold text-white tracking-tight flex items-baseline gap-1">
                +{tradableCCC.toLocaleString()}
                <span className="text-xs font-normal text-slate-400">CCC/yr</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                1 CCC = 1 tCO₂e abated
              </div>
            </div>
          </div>

          {/* Card 2: Annual Carbon Revenue */}
          <div className="p-3.5 rounded-lg bg-[#141822] border border-[#212735] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                ICM Carbon Revenue
              </div>
              <div className="text-lg font-bold text-cyan-300 tracking-tight">
                {formatCurrency(carbonRevenue)}
              </div>
              <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">
                @ ₹{carbonPrice.toLocaleString('en-IN')}/CCC rate
              </div>
            </div>
          </div>

          {/* Card 3: Accelerated Capital Payback */}
          <div className="p-3.5 rounded-lg bg-[#141822] border border-[#212735] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                CCTS Payback
              </div>
              <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-lg font-bold text-purple-300">
                  {investmentInr > 0
                    ? (acceleratedPayback > 0 ? `${acceleratedPayback} yrs` : 'Immediate')
                    : 'Accretive'}
                </span>
                {speedupPct > 0 && investmentInr > 0 && (
                  <span className="text-[10px] font-mono text-emerald-400">
                    (-{speedupPct}%)
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                {investmentInr > 0
                  ? `Std: ${standardPayback > 0 ? `${standardPayback} yrs` : 'Immediate'}`
                  : 'Net Carbon Asset'}
              </div>
            </div>
          </div>

          {/* Card 4: Statutory Penalty Avoidance */}
          <div className="p-3.5 rounded-lg bg-gradient-to-br from-emerald-950/40 via-[#141822] to-emerald-950/20 border border-emerald-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                Statutory Shield
              </div>
              <div className="text-lg font-extrabold text-emerald-300 tracking-tight">
                {penaltyAvoided > 0 ? formatCurrency(penaltyAvoided) : '₹0 Deficit'}
              </div>
              <div className="text-[10px] text-emerald-400/90 font-mono mt-0.5">
                Penalty liability avoided
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Indian Carbon Market (ICM) Price Sensitivity Slider */}
        <div className="p-4 rounded-lg bg-[#0e121a] border border-[#1f2636] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Indian Carbon Market (ICM) Trading Price Simulator
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Adjust benchmark trading price for Indian Carbon Market (IEX / Power Exchange of India)
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#151c27] px-3 py-1.5 rounded border border-[#232c3d]">
              <span className="text-xs text-slate-400">Selected Rate:</span>
              <span className="text-sm font-bold text-emerald-300 font-mono">
                ₹{carbonPrice.toLocaleString('en-IN')} / CCC
              </span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <input
              type="range"
              min="1000"
              max="3500"
              step="50"
              value={carbonPrice}
              onChange={(e) => setCarbonPrice(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-[#1f2636] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
              <span>₹1,000 / CCC (Conservative)</span>
              <span className="text-emerald-400 font-semibold">₹1,850 / CCC (BEE Central Benchmark)</span>
              <span>₹3,500 / CCC (High Demand)</span>
            </div>
          </div>
        </div>

        {/* BEE Baseline Intensity vs Actual Comparison */}
        <div className="p-4 rounded-lg bg-[#141822] border border-[#212735] space-y-3">
          <div className="flex flex-wrap items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-200">
                GHG Emission Intensity Performance
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                ({cctsData.sector || 'Industrial Sector'})
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <div>
                <span className="text-slate-400">Actual: </span>
                <strong className={isCreditSurplus ? 'text-emerald-400' : 'text-amber-400'}>
                  {cctsData.actual_intensity_tco2_per_tonne} tCO₂e/t
                </strong>
              </div>
              <div>
                <span className="text-slate-400">BEE Target: </span>
                <strong className="text-cyan-400">
                  {cctsData.target_intensity_tco2_per_tonne} tCO₂e/t
                </strong>
              </div>
            </div>
          </div>

          {/* Intensity Comparison Visual Bar */}
          <div className="space-y-1">
            <div className="h-2.5 w-full bg-[#1b2230] rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${Math.min(100, Math.max(10, (cctsData.actual_intensity_tco2_per_tonne / (cctsData.target_intensity_tco2_per_tonne * 1.5)) * 100))}%`,
                }}
                className={`h-full transition-all duration-300 ${
                  isCreditSurplus ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-rose-500'
                }`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>0.00 tCO₂e/t</span>
              <span className="text-cyan-400 flex items-center gap-1">
                ▲ Target Threshold ({cctsData.target_intensity_tco2_per_tonne} tCO₂e/t)
              </span>
              <span>2.00+ tCO₂e/t</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
            {cctsData.compliance_message}
          </p>
        </div>

        {/* Regulatory Governance Footnote */}
        <div className="p-3.5 rounded bg-[#10141d] border border-[#1b2230] flex items-start gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-slate-200 font-semibold">
              Bureau of Energy Efficiency (BEE) & Indian Carbon Market Architecture
            </span>
            <p className="text-[11px] leading-relaxed">
              Under India's Carbon Credit Trading Scheme (CCTS), Designated Consumers (DCs) are legally eligible to monetize
              verified emission intensity reductions below their allocated national target. CircuLeak links real-time machinery
              monitoring with ICM trading valuations, transforming environmental compliance from a statutory cost into an active
              balance sheet asset for industrial plant management.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
