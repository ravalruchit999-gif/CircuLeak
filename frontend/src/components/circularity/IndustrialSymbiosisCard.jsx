import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SectionCard } from '../ui/SectionCard';
import {
  Recycle,
  Building2,
  TrendingUp,
  Truck,
  ArrowRight,
  ShieldCheck,
  Coins,
  Leaf,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  X,
  Sparkles
} from 'lucide-react';
import { addSymbiosisStream, deleteSymbiosisStream } from '../../services/symbiosisApi';

export function IndustrialSymbiosisCard({ symbiosisData, facilityId, onRefresh }) {
  const [selectedStream, setSelectedStream] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const [formData, setFormData] = useState({
    byproduct_name: '',
    category: 'Hazardous Liquid Waste',
    annual_quantity: '',
    unit: 'Tonnes/year',
    current_disposal_cost_per_unit: '',
    selling_price_per_unit: '',
    offtaker_partner: '',
    circular_loop: '',
  });

  if (!symbiosisData || !symbiosisData.streams || symbiosisData.streams.length === 0) {
    return null;
  }

  const { totals = {}, streams = [], cluster_region } = symbiosisData;

  const filteredStreams = filterCategory === 'ALL'
    ? streams
    : streams.filter((s) => s.category.toUpperCase().includes(filterCategory.toUpperCase()));

  const categories = ['ALL', ...new Set(streams.map((s) => s.category))];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateStream = async (e) => {
    e.preventDefault();
    if (!formData.byproduct_name || !formData.annual_quantity) return;

    setSubmitting(true);
    try {
      const payload = {
        byproduct_name: formData.byproduct_name,
        category: formData.category,
        annual_quantity: parseFloat(formData.annual_quantity) || 10.0,
        unit: formData.unit,
        current_disposal_cost_per_unit: parseFloat(formData.current_disposal_cost_per_unit) || 2000.0,
        selling_price_per_unit: parseFloat(formData.selling_price_per_unit) || 1200.0,
        offtaker_partner: formData.offtaker_partner.trim() || undefined,
        circular_loop: formData.circular_loop.trim() || undefined,
      };

      const res = await addSymbiosisStream(facilityId || symbiosisData.facility_id || 1, payload);
      if (res && (res.success || res.data)) {
        setIsModalOpen(false);
        setFormData({
          byproduct_name: '',
          category: 'Hazardous Liquid Waste',
          annual_quantity: '',
          unit: 'Tonnes/year',
          current_disposal_cost_per_unit: '',
          selling_price_per_unit: '',
          offtaker_partner: '',
          circular_loop: '',
        });
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to list custom stream:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStream = async (streamId) => {
    if (!window.confirm('Remove this custom waste stream from the exchange?')) return;
    setDeletingId(streamId);
    try {
      await deleteSymbiosisStream(facilityId || symbiosisData.facility_id || 1, streamId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete stream:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <SectionCard
        title="Industrial Symbiosis & Waste-to-Resource Exchange"
        subtitle={`Connecting factory by-product streams to regional circular off-takers across ${cluster_region || 'Industrial Corridor'}`}
        badge={
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-[10px] font-mono text-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{totals.matches_count || streams.length} Verified Off-Taker Loops</span>
          </div>
        }
        action={
          <div className="flex items-center gap-2">
            {/* Category Filter Chips */}
            <div className="hidden sm:flex items-center gap-1 bg-[#10141d] p-1 rounded border border-[#212736]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                    filterCategory === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#18202d]'
                  }`}
                >
                  {cat === 'ALL' ? 'All' : cat}
                </button>
              ))}
            </div>

            {/* "+ List Waste Stream" Action Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List Waste Stream</span>
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Top KPI Metric Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Metric 1: Landfill Diverted */}
            <div className="p-3.5 rounded-lg bg-[#141822] border border-[#212735] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shrink-0">
                <Recycle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Landfill Diverted
                </div>
                <div className="text-lg font-bold text-white tracking-tight flex items-baseline gap-1">
                  {Number(totals.landfill_diverted_tonnes || 0).toLocaleString()}
                  <span className="text-xs font-normal text-slate-400">t/yr</span>
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono mt-0.5">
                  <Leaf className="w-2.5 h-2.5" />
                  {totals.co2_abatement_tonnes || 0} tCO₂e avoided
                </div>
              </div>
            </div>

            {/* Metric 2: Disposal Cost Avoided */}
            <div className="p-3.5 rounded-lg bg-[#141822] border border-[#212735] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Disposal Fee Saved
                </div>
                <div className="text-lg font-bold text-cyan-200 tracking-tight">
                  ₹{Number(totals.disposal_cost_avoided_inr || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Zero tipping liability
                </div>
              </div>
            </div>

            {/* Metric 3: By-Product Revenue */}
            <div className="p-3.5 rounded-lg bg-[#141822] border border-[#212735] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  By-Product Sales
                </div>
                <div className="text-lg font-bold text-amber-200 tracking-tight">
                  ₹{Number(totals.byproduct_revenue_inr || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Secondary market value
                </div>
              </div>
            </div>

            {/* Metric 4: Total Economic Benefit */}
            <div className="p-3.5 rounded-lg bg-gradient-to-br from-emerald-950/40 via-[#141822] to-emerald-950/20 border border-emerald-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                  Net Annual Value
                </div>
                <div className="text-lg font-extrabold text-emerald-300 tracking-tight">
                  ₹{Number(totals.net_economic_benefit_inr || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-emerald-400/90 font-mono mt-0.5">
                  Annual margin expansion
                </div>
              </div>
            </div>
          </div>

          {/* By-Product Streams Exchange Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
              <span>OFF-TAKER BY-PRODUCT ALLOCATIONS ({filteredStreams.length})</span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct Industrial Off-Take Contracts
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {filteredStreams.map((stream, idx) => {
                return (
                  <div
                    key={stream.stream_id || idx}
                    className="rounded-lg bg-[#141822] border border-[#212735] hover:border-emerald-600/50 transition-all p-4 space-y-3.5"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-100">
                            {stream.byproduct_name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1b2230] border border-[#2a3449] text-slate-300">
                            {stream.category}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/80 text-emerald-300">
                            {stream.circular_tier}
                          </span>
                          {stream.is_custom && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> User Listed
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          <span>Volume: <strong className="text-slate-200">{stream.annual_quantity} {stream.unit}</strong></span>
                          <span>•</span>
                          <span className="text-emerald-400 font-mono font-medium">
                            {stream.diversion_rate_percent}% Landfill Diverted
                          </span>
                        </div>
                      </div>

                      {/* Economic Net Gain & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[10px] font-mono uppercase text-slate-400">
                            Net Circular Gain
                          </div>
                          <div className="text-base font-bold text-emerald-300 font-mono">
                            +₹{Number(stream.net_benefit_inr || 0).toLocaleString('en-IN')}/yr
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Saved ₹{Number(stream.disposal_cost_avoided_inr || 0).toLocaleString('en-IN')} + Sold ₹{Number(stream.byproduct_revenue_inr || 0).toLocaleString('en-IN')}
                          </div>
                        </div>

                        {stream.is_custom && (
                          <button
                            onClick={() => handleDeleteStream(stream.id)}
                            disabled={deletingId === stream.id}
                            title="Remove waste stream"
                            className="p-1.5 rounded bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/60 text-rose-300 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Symbiosis Loop: Linear -> Circular Off-taker */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-md bg-[#0f131a] border border-[#1b2230] text-xs">
                      {/* Linear baseline */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-rose-400/90 uppercase tracking-wider flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Linear Baseline (Disposal)
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {stream.linear_pathway}
                        </p>
                      </div>

                      {/* Circular symbiosis match */}
                      <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#212735] pt-2 md:pt-0 md:pl-3">
                        <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Circular Off-Taker Match
                        </div>
                        <p className="text-slate-200 text-[11px] font-medium leading-relaxed">
                          {stream.circular_loop}
                        </p>
                      </div>
                    </div>

                    {/* Partner & Logistics Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#1e2533] text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-medium text-slate-200">{stream.offtaker_partner}</span>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] font-mono">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Truck className="w-3 h-3 text-amber-400" />
                          <span>Logistics: <strong className="text-slate-300">{stream.distance_km} km radius</strong></span>
                        </div>

                        <div className="flex items-center gap-1 text-emerald-400">
                          <Leaf className="w-3 h-3" />
                          <span>-{stream.co2_abatement_tonnes} tCO₂e</span>
                        </div>

                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-[10px] text-emerald-300">
                          {stream.readiness}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Register Custom Waste Stream Modal (Portaled to document.body for true full-screen blur) */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/35 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-[#121620]/95 backdrop-blur-lg border border-[#283246] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#232b3c] flex items-center justify-between bg-[#161c28]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                  <Recycle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    List Waste Stream for Circular Off-Take
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Auto-matches with verified regional industrial buyers in Gujarat
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-[#202738] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateStream} className="p-6 space-y-4">
              {/* Field 1: By-Product Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Waste / By-Product Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="byproduct_name"
                  value={formData.byproduct_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Used Quenching Oil, Spent Sand Cores, Wood Pallets"
                  className="w-full px-3 py-2 bg-[#0c0f16] border border-[#232b3c] rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Field 2: Category & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#0c0f16] border border-[#232b3c] rounded-md text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Hazardous Liquid Waste">Hazardous Liquid Waste / Oil</option>
                    <option value="Solid Mineral Waste">Solid Mineral Waste / Sand / Slag</option>
                    <option value="Polymer Scrap">Polymer / Plastic Scrap</option>
                    <option value="Metallic Scrap">Metallic Scrap / Turnings</option>
                    <option value="Biomass & Wood">Biomass / Timber / Pallets</option>
                    <option value="Packaging Waste">Packaging / General Waste</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Measurement Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#0c0f16] border border-[#232b3c] rounded-md text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Tonnes/year">Tonnes/year</option>
                    <option value="KL/year">KL/year (Kilolitres)</option>
                    <option value="GJ/year">GJ/year (Thermal Energy)</option>
                  </select>
                </div>
              </div>

              {/* Field 3: Quantity & Current Disposal Fee */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Annual Volume <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="annual_quantity"
                    value={formData.annual_quantity}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 bg-[#0c0f16] border border-[#232b3c] rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Current Disposal Fee (₹/unit)
                  </label>
                  <input
                    type="number"
                    name="current_disposal_cost_per_unit"
                    value={formData.current_disposal_cost_per_unit}
                    onChange={handleInputChange}
                    placeholder="e.g. 2500"
                    className="w-full px-3 py-2 bg-[#0c0f16] border border-[#232b3c] rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Field 4: Selling Price & Desired Buyer */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Target Selling Price (₹/unit)
                  </label>
                  <input
                    type="number"
                    name="selling_price_per_unit"
                    value={formData.selling_price_per_unit}
                    onChange={handleInputChange}
                    placeholder="e.g. 1500"
                    className="w-full px-3 py-2 bg-[#0c0f16] border border-[#232b3c] rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Specific Buyer (Optional)
                  </label>
                  <input
                    type="text"
                    name="offtaker_partner"
                    value={formData.offtaker_partner}
                    onChange={handleInputChange}
                    placeholder="Auto-match if blank"
                    className="w-full px-3 py-2 bg-[#0c0f16] border border-[#232b3c] rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Live Preview Calculation */}
              {formData.annual_quantity && (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/60 text-xs space-y-1">
                  <div className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
                    Instant Economic Impact
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Disposal Fee Saved:</span>
                    <strong className="text-cyan-300 font-mono">
                      ₹{((parseFloat(formData.annual_quantity) || 0) * (parseFloat(formData.current_disposal_cost_per_unit) || 2000)).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>By-Product Sales Revenue:</span>
                    <strong className="text-amber-300 font-mono">
                      ₹{((parseFloat(formData.annual_quantity) || 0) * (parseFloat(formData.selling_price_per_unit) || 1200)).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-emerald-300 pt-1 border-t border-emerald-800/60 font-bold">
                    <span>Total Net Annual Gain:</span>
                    <span className="font-mono">
                      +₹{((parseFloat(formData.annual_quantity) || 0) * ((parseFloat(formData.current_disposal_cost_per_unit) || 2000) + (parseFloat(formData.selling_price_per_unit) || 1200))).toLocaleString('en-IN')}/yr
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232b3c]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#1b2230] hover:bg-[#232c3e] text-slate-300 rounded-md text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Registering...' : 'Match & Register Stream'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
