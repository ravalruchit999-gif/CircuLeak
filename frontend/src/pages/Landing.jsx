import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Flame,
  Zap,
  TrendingDown,
  FileSpreadsheet,
  ArrowRight,
  Sliders,
  Award,
  Layers,
  CheckCircle2,
  Lock,
  FileText,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Landing() {
  const { user } = useAuth();

  const destinationDashboard = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Dynamic Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-emerald-600/15 via-teal-600/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-[35%] -left-32 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute top-[60%] -right-32 w-[550px] h-[550px] bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#07090e]/80 border-b border-[#141a26]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black text-sm tracking-tighter shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
              CL
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Circu<span className="text-emerald-400">Leak</span></span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  v2.4 Live
                </span>
              </div>
              <div className="text-[9px] font-mono text-slate-400 tracking-wider hidden sm:block">
                CARBON INTELLIGENCE
              </div>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#capabilities" className="hover:text-emerald-400 transition-colors">
              Platform Capabilities
            </a>
            <a href="#architecture" className="hover:text-emerald-400 transition-colors">
              Detection Pipeline
            </a>
            <a href="#governance" className="hover:text-emerald-400 transition-colors">
              Compliance & Security
            </a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-medium text-white truncate max-w-[140px]">
                    {user.full_name}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400">
                    {user.role === 'admin' ? 'Platform Auditor' : 'Facility Workspace'}
                  </div>
                </div>
                <Link to={destinationDashboard}>
                  <Button variant="primary" size="sm" className="shadow-lg shadow-emerald-900/30">
                    <span>Open Console</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="text-xs shadow-md shadow-emerald-900/30">
                    <span>Register Facility</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111723] border border-[#1e2638] text-xs text-slate-300 font-mono mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Deterministic Industrial Carbon Intelligence & Leak Isolation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Detect Hidden Emission Leaks.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Preserve Capital.
            </span>{' '}
            Automate Circularity.
          </h1>

          <p className="mt-6 text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            CircuLeak ingests raw SCADA telemetry and operational spreadsheets, detects unloader valve bypasses and thermal heat dissipation leaks, and generates ROI-ranked circular interventions backed by real plant math.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {user ? (
              <Link to={destinationDashboard} className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto justify-center px-8 text-sm font-semibold shadow-xl shadow-emerald-900/40">
                  <span>Enter Facility Console</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto justify-center px-8 text-sm font-semibold shadow-xl shadow-emerald-900/40">
                    <span>Onboard Your Facility</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto justify-center px-8 text-sm font-medium">
                    <span>Sign In to Existing Facility</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Metric Highlights Strip */}
          <div className="mt-14 pt-8 border-t border-[#141b29] grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-left max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-[#0d121c]/80 border border-[#192234]">
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 mt-1">Deterministic Math</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Zero mock estimations</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0d121c]/80 border border-[#192234]">
              <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">&lt; 15 min</div>
              <div className="text-xs text-slate-400 mt-1">Telemetry Diagnostics</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Sub-metering ingestion</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0d121c]/80 border border-[#192234]">
              <div className="text-xl sm:text-2xl font-bold font-mono text-teal-400">BEE CCTS</div>
              <div className="text-xs text-slate-400 mt-1">Compliance Standard</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">National sector thresholds</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0d121c]/80 border border-[#192234]">
              <div className="text-xl sm:text-2xl font-bold font-mono text-purple-400">RBAC</div>
              <div className="text-xs text-slate-400 mt-1">Single-Admin Isolation</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Strict multi-tenancy</div>
            </div>
          </div>
        </section>

        {/* PIPELINE ARCHITECTURE SHOWCASE */}
        <section id="architecture" className="py-16 bg-[#0a0e17] border-y border-[#141a27]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">
                Autonomous Data Flow
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                From Operational Logs to Net-Zero Execution
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Four deterministic stages bridge physical industrial sub-metering with circular boardroom decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="p-5 rounded-xl bg-[#0f1420] border border-[#1c2436] relative group hover:border-emerald-500/50 transition-all">
                <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="text-xs font-mono text-emerald-400 mb-1">01. INGESTION</div>
                <h3 className="text-sm font-semibold text-white">CSV & XLSX Ingestion</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Automatic header token mapping, duplicate column sanitization, and 5-dimension quality grading.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-xl bg-[#0f1420] border border-[#1c2436] relative group hover:border-cyan-500/50 transition-all">
                <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center mb-4">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs font-mono text-cyan-400 mb-1">02. ACCOUNTING</div>
                <h3 className="text-sm font-semibold text-white">Scope 1 & 2 Engine</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Row-level calculation applying national electricity factors (0.82 kg/kWh) and direct fossil fuel stoichiometry.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-xl bg-[#0f1420] border border-[#1c2436] relative group hover:border-amber-500/50 transition-all">
                <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center mb-4">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="text-xs font-mono text-amber-400 mb-1">03. LEAK ISOLATION</div>
                <h3 className="text-sm font-semibold text-white">Structural Hotspots</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Identifies off-hours idle power drain, unloader leaks, and furnace thermal dissipation with risk scores.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-5 rounded-xl bg-[#0f1420] border border-[#1c2436] relative group hover:border-purple-500/50 transition-all">
                <div className="w-9 h-9 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center mb-4">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div className="text-xs font-mono text-purple-400 mb-1">04. CIRCULAR ACTION</div>
                <h3 className="text-sm font-semibold text-white">5-Year Trajectory & ROI</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Ranks circular alternative retrofits by payback period, models what-if scenarios, and produces audit-ready PDF reports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CORE CAPABILITIES GRID */}
        <section id="capabilities" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">
              Deep Industrial Carbon Tech
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Engineered Specifically for Heavy Industry
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Replacing guesswork and static consultant slide decks with real-time process monitoring and deterministic algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-xl bg-[#0c1018] border border-[#192233] hover:border-emerald-500/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Carbon Leak Point Detector</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Flags abnormal consumption patterns such as continuous baseline power during zero-production weekends, compressed air line leaks, and degraded boiler efficiency.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-xl bg-[#0c1018] border border-[#192233] hover:border-teal-500/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Interactive What-If Simulator</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Dynamically toggle intervention combinations (Waste Heat Recovery, Biomass Fuel Switching, Solar PV, Air Audits) to preview payback years, CAPEX, and tCO2e avoided.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-xl bg-[#0c1018] border border-[#192233] hover:border-cyan-500/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">National Peer Benchmarking</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Compares facility emission intensity (kgCO2e per production ton) against national median benchmarks and Bureau of Energy Efficiency (BEE) CCTS compliance caps.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-xl bg-[#0c1018] border border-[#192233] hover:border-purple-500/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Circularity Index & Scoring</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Evaluates facility operations across 5 dimensions: Thermal Energy Efficiency, Electrical Waste Ratio, Renewable Penetration, and Emission Intensity to output an 0-100 score.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 rounded-xl bg-[#0c1018] border border-[#192233] hover:border-blue-500/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">5-Year Net-Zero Trajectory</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Forecasts business-as-usual emissions vs planned intervention phase-ins through 2030, showing cumulative carbon offset milestones and recurring operational savings.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-6 rounded-xl bg-[#0c1018] border border-[#192233] hover:border-emerald-500/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">12-Section Executive PDF Report</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                One-click automated generation of publication-ready audit reports with methodology descriptions, hotspot breakdown tables, intervention rankings, and regulatory sign-offs.
              </p>
            </div>
          </div>
        </section>

        {/* SECURITY & GOVERNANCE SECTION */}
        <section id="governance" className="py-16 bg-[#0a0e17] border-t border-[#141a27]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-[#0d1320] via-[#0f1726] to-[#0d1320] border border-[#1c263b] flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Enterprise Security & Role-Based Access Control</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Multi-Facility Governance with Strict Tenant Isolation
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Each facility operates in a strictly isolated workspace. Platform administration is locked to a single designated auditor account, preventing unauthorized role escalation or cross-tenant data leakage.
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-300 font-mono">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>PostgreSQL 17 ACID Ledger</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Bcrypt 12-Round Password Hashes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Signed 24h JWT Tokens</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <Link to="/register">
                  <Button variant="primary" size="lg" className="px-8 shadow-xl shadow-emerald-900/30">
                    Create Facility Workspace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#141a27] bg-[#05070a] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-[10px]">
              CL
            </div>
            <span>CircuLeak &copy; {new Date().getFullYear()} — Industrial Carbon Intelligence & Circular Optimization</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <Link to="/login" className="hover:text-emerald-400 transition-colors">
              Auditor & Manager Login
            </Link>
            <Link to="/register" className="hover:text-emerald-400 transition-colors">
              Facility Onboarding
            </Link>
            <span className="text-emerald-500 font-semibold">
              ● API Engine Live
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
