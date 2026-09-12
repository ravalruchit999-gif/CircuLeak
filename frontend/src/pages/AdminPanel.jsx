import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { MetricCard } from '../components/ui/MetricCard';
import { getAdminStats, getAdminFacilities, getAdminUsers, getAdminEmissionFactors } from '../services/adminApi';
import { useFacilityContext } from '../context/FacilityContext';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Building2,
  Users,
  Database,
  Flame,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sliders,
  Award
} from 'lucide-react';

export function AdminPanel() {
  const navigate = useNavigate();
  const { setCurrentFacilityId, setFacilityName } = useFacilityContext();

  const [stats, setStats] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [users, setUsers] = useState([]);
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, facsRes, usersRes, factorsRes] = await Promise.all([
        getAdminStats(),
        getAdminFacilities(),
        getAdminUsers(),
        getAdminEmissionFactors(),
      ]);
      setStats(statsRes.data);
      setFacilities(facsRes.data);
      setUsers(usersRes.data);
      setFactors(factorsRes.data);
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
      />

      {/* Global Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Facilities"
          value={stats?.total_facilities || facilities.length}
          unit="Industrial Units"
          subtext="Active tenant workspaces"
          icon={Building2}
        />
        <MetricCard
          title="Platform Users"
          value={stats?.total_users || users.length}
          unit="Managers & Auditors"
          subtext="Role-based access active"
          icon={Users}
        />
        <MetricCard
          title="Ingested Telemetry Records"
          value={(stats?.total_telemetry_rows || 672).toLocaleString()}
          unit="Time-Series Rows"
          subtext="Synchronized in PostgreSQL 17"
          icon={Database}
        />
        <MetricCard
          title="Detected Carbon Leaks"
          value={stats?.total_leaks_flagged || 1}
          unit="Active Anomalies"
          subtext="Flagged via ML Z-Score detection"
          delta="Requires Review"
          deltaType="positive_is_bad"
          icon={Flame}
        />
      </div>

      {/* Multi-Facility Governance Directory */}
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
                <th className="pb-3 px-3 text-center">Data Ingestion</th>
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
                      Open Dashboard <ExternalLink className="w-3 h-3" />
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
        {/* User Accounts */}
        <SectionCard
          title="User Accounts & Access Permissions"
          subtitle="Registered operators and security roles"
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
                      {u.facility_name || u.company_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Master Regulatory Emission Factors */}
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
  );
}
export default AdminPanel;
