import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { MetricCard } from '../components/ui/MetricCard';
import {
  getAdminStats,
  getAdminFacilities,
  getAdminUsers,
  getAdminEmissionFactors,
  getAdminUploads,
  getAdminAuditLogs,
  getAdminBenchmarks,
  recalculateBenchmarks,
} from '../services/adminApi';
import { useFacilityContext } from '../context/FacilityContext';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Database,
  Flame,
  CheckCircle2,
  Clock,
  ExternalLink,
  Award,
  RefreshCw,
  FileSpreadsheet,
  History
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export function AdminPanel() {
  const navigate = useNavigate();
  const { setCurrentFacilityId, setFacilityName } = useFacilityContext();

  const [activeTab, setActiveTab] = useState('overview'); // overview, uploads, audit_logs, benchmarks
  const [stats, setStats] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [users, setUsers] = useState([]);
  const [factors, setFactors] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, facsRes, usersRes, factorsRes, uploadsRes, logsRes, benchRes] = await Promise.allSettled([
        getAdminStats(),
        getAdminFacilities(),
        getAdminUsers(),
        getAdminEmissionFactors(),
        getAdminUploads(),
        getAdminAuditLogs(),
        getAdminBenchmarks(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (facsRes.status === 'fulfilled') setFacilities(facsRes.value.data || []);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data || []);
      if (factorsRes.status === 'fulfilled') setFactors(factorsRes.value.data || []);
      if (uploadsRes.status === 'fulfilled') setUploads(uploadsRes.value.data || []);
      if (logsRes.status === 'fulfilled') setAuditLogs(logsRes.value.data || []);
      if (benchRes.status === 'fulfilled') setBenchmarks(benchRes.value.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load administration governance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSwitchFacility = (facility) => {
    setCurrentFacilityId(facility.id);
    setFacilityName(facility.business_name);
    navigate('/dashboard');
  };

  const handleRecalculateBenchmarks = async () => {
    setIsRecalculating(true);
    try {
      await recalculateBenchmarks();
      const benchRes = await getAdminBenchmarks();
      setBenchmarks(benchRes.data || []);
    } catch (err) {
      setError('Benchmark calculation notice: ' + err.message);
    } finally {
      setIsRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Platform Administration & Multi-Facility Governance" />
        <LoadingState rows={6} message="Aggregating multi-facility audit registries..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Platform Administration & Multi-Facility Governance" />
        <ErrorState message={error} onRetry={fetchAdminData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chief Auditor Governance Console"
        subtitle="Multi-facility oversight, regulatory emission factors master data, and user tenant administration"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
            System Admin Level
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              loading={isRecalculating}
              onClick={handleRecalculateBenchmarks}
              icon={RefreshCw}
            >
              Recalculate Benchmarks
            </Button>
          </div>
        }
      />

      {/* Global Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Facilities"
          value={stats?.total_facilities ?? facilities.length}
          unit="Industrial Units"
          subtext="Active tenant workspaces"
          icon={Building2}
        />
        <MetricCard
          title="Platform Users"
          value={stats?.total_users ?? users.length}
          unit="Managers & Auditors"
          subtext="Role-based access active"
          icon={Users}
        />
        <MetricCard
          title="Ingested Telemetry Records"
          value={(stats?.total_telemetry_rows ?? 0).toLocaleString()}
          unit="Time-Series Rows"
          subtext="Synchronized in PostgreSQL 17"
          icon={Database}
        />
        <MetricCard
          title="Detected Carbon Leaks"
          value={stats?.total_leaks_flagged ?? 0}
          unit="Active Anomalies"
          subtext="Flagged via baseline anomaly detection"
          icon={Flame}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1f2635] pb-2 text-xs font-mono">
        {[
          { id: 'overview', label: 'Facilities & Users', icon: Building2 },
          { id: 'uploads', label: `Ingestion History (${uploads.length})`, icon: FileSpreadsheet },
          { id: 'audit_logs', label: `Audit Trail (${auditLogs.length})`, icon: History },
          { id: 'benchmarks', label: `Sector Benchmarks (${benchmarks.length})`, icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                isActive
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FACILITIES & USERS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <SectionCard
            title="Manufacturing Facilities Directory"
            subtitle="Overview of registered industrial units, telemetry volume, and operational status"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#232d3e] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-3">Facility Name</th>
                    <th className="pb-3 px-3">Sector</th>
                    <th className="pb-3 px-3">Lead Owner</th>
                    <th className="pb-3 px-3 text-right">Telemetry Rows</th>
                    <th className="pb-3 px-3 text-center">Data Status</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2533]">
                  {facilities.map((fac) => (
                    <tr key={fac.id} className="hover:bg-[#151a24] transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-white block text-sm font-sans">
                          {fac.business_name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ID: {fac.id} • {fac.location}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-sans">{fac.sector}</td>
                      <td className="py-3 px-3 text-slate-300 font-sans">
                        <span className="block text-slate-200 font-medium">{fac.owner_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{fac.owner_email}</span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-200 font-bold">
                        {fac.telemetry_rows?.toLocaleString() || 0}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {fac.has_data ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active Data
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px]">
                            <Clock className="w-3 h-3 text-amber-400" /> Awaiting CSV
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleSwitchFacility(fac)}
                          className="px-2.5 py-1 rounded bg-[#1c2433] hover:bg-emerald-600 hover:text-white border border-[#2b374d] text-emerald-400 transition-all text-xs font-sans font-medium inline-flex items-center gap-1"
                        >
                          Inspect <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Two Column Layout: User Accounts & Emission Factors Master */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title="User Accounts & Access Permissions"
              subtitle="Registered tenant operators and platform roles"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#232d3e] text-slate-400 uppercase text-[10px] font-mono tracking-wider">
                      <th className="pb-2 px-2">User / Email</th>
                      <th className="pb-2 px-2">Role</th>
                      <th className="pb-2 px-2">Assigned Facility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2533]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#151a24]">
                        <td className="py-2.5 px-2">
                          <span className="font-semibold text-slate-100 block">{u.full_name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{u.email}</span>
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              u.role === 'admin'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-300 text-[11px] truncate max-w-[140px]">
                          {u.facility_name || u.company_name || 'All Facilities (Admin)'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard
              title="Regulatory Emission Conversion Master"
              subtitle="Standards calibrated against BEE & CEA India guidelines"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#232d3e] text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-2 px-2">Source</th>
                      <th className="pb-2 px-2">Factor</th>
                      <th className="pb-2 px-2">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2533]">
                    {factors.map((ef) => (
                      <tr key={ef.id} className="hover:bg-[#151a24]">
                        <td className="py-2.5 px-2">
                          <span className="font-semibold text-white uppercase text-[11px] block">
                            {ef.source_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400">{ef.region}</span>
                        </td>
                        <td className="py-2.5 px-2 text-emerald-400 font-bold">
                          {ef.factor_value} <span className="text-[10px] text-slate-400">{ef.unit}</span>
                        </td>
                        <td className="py-2.5 px-2 text-[10px] text-slate-300 truncate max-w-[140px]">
                          {ef.source_reference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* TAB 2: INGESTION HISTORY */}
      {activeTab === 'uploads' && (
        <SectionCard
          title="Telemetry Dataset Ingestion History"
          subtitle="Audit log of uploaded CSV and XLSX datasets with quality confidence scoring"
        >
          {uploads.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-mono">
              No datasets uploaded yet. Ingest telemetry from the Data Upload wizard.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#232d3e] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5 px-3">Run ID</th>
                    <th className="pb-2.5 px-3">Facility</th>
                    <th className="pb-2.5 px-3">Filename</th>
                    <th className="pb-2.5 px-3 text-right">Valid Rows</th>
                    <th className="pb-2.5 px-3 text-center">Quality Score</th>
                    <th className="pb-2.5 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2533]">
                  {uploads.map((u) => (
                    <tr key={u.id} className="hover:bg-[#151a24]">
                      <td className="py-2.5 px-3 text-slate-300 font-bold">{u.analysis_run_id}</td>
                      <td className="py-2.5 px-3 text-slate-200">Facility #{u.facility_id}</td>
                      <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">{u.filename}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                        {(u.valid_row_count || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                          {Math.round(u.quality_score || 90)}% ({u.quality_level || 'HIGH'})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                        {u.uploaded_at ? new Date(u.uploaded_at).toLocaleString() : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'audit_logs' && (
        <SectionCard
          title="Immutable Platform Audit Trail"
          subtitle="System actions, dataset uploads, user authentications, and threshold updates"
        >
          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-mono">
              No audit entries recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#232d3e] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5 px-3">Action</th>
                    <th className="pb-2.5 px-3">Resource</th>
                    <th className="pb-2.5 px-3">User ID</th>
                    <th className="pb-2.5 px-3">Details</th>
                    <th className="pb-2.5 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2533]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#151a24]">
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px] uppercase">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {log.resource} #{log.resource_id}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{log.user_id || 'System'}</td>
                      <td className="py-2.5 px-3 text-slate-300 truncate max-w-sm">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {/* TAB 4: SECTOR BENCHMARKS */}
      {activeTab === 'benchmarks' && (
        <SectionCard
          title="Cross-Facility Sector Benchmark Standards"
          subtitle="Dynamic benchmarks derived from actual monitored facilities and national sectoral baselines"
        >
          {benchmarks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-mono space-y-2">
              <p>No sector benchmarks calculated yet.</p>
              <Button
                variant="primary"
                size="sm"
                loading={isRecalculating}
                onClick={handleRecalculateBenchmarks}
              >
                Calculate Sector Benchmarks Now
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#232d3e] text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5 px-3">Sector</th>
                    <th className="pb-2.5 px-3 text-right">Intensity Benchmark</th>
                    <th className="pb-2.5 px-3 text-right">Top 10% Decile</th>
                    <th className="pb-2.5 px-3 text-center">Facility Count</th>
                    <th className="pb-2.5 px-3 text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2533]">
                  {benchmarks.map((b) => (
                    <tr key={b.id} className="hover:bg-[#151a24]">
                      <td className="py-2.5 px-3 font-semibold text-slate-100">{b.sector}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                        {b.average_intensity} <span className="text-slate-400 text-[10px]">{b.unit}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        {b.top_10_percent_intensity} <span className="text-slate-500 text-[10px]">{b.unit}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-200">
                        {b.facility_count || 1}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                        {b.updated_at ? new Date(b.updated_at).toLocaleDateString() : 'Active'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
export default AdminPanel;
