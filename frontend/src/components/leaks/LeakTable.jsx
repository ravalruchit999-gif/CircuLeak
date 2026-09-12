import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Filter } from 'lucide-react';
import { SectionCard } from '../ui/SectionCard';
import { LeakRiskBadge } from './LeakRiskBadge';
import { Button } from '../ui/Button';

export function LeakTable({ leaks = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filteredLeaks = leaks.filter((leak) => {
    const matchesSearch =
      String(leak.equipment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(leak.process || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(leak.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === 'ALL') return matchesSearch;
    if (selectedFilter === 'CRITICAL') return matchesSearch && Number(leak.risk_score || 0) >= 80;
    if (selectedFilter === 'HIGH') return matchesSearch && Number(leak.risk_score || 0) >= 60 && Number(leak.risk_score || 0) < 80;
    return matchesSearch;
  });

  return (
    <SectionCard
      title="Carbon Leak Detection Registry"
      subtitle="Comprehensive list of flagged process anomalies ranked by risk and deviation"
    >
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search equipment or process..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#161a24] border border-[#263042] rounded text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
          <span className="text-slate-400 mr-1 text-[11px] font-mono">FILTER:</span>
          {['ALL', 'CRITICAL', 'HIGH'].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                selectedFilter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#181d28] text-slate-400 hover:text-slate-200 hover:bg-[#202737]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#202738] text-slate-400 font-mono uppercase tracking-wider">
              <th className="pb-3 font-medium">Anomaly ID & Equipment</th>
              <th className="pb-3 font-medium">Process</th>
              <th className="pb-3 font-medium">Abnormal Period</th>
              <th className="pb-3 font-medium text-right">Deviation</th>
              <th className="pb-3 font-medium text-right">Risk Score</th>
              <th className="pb-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181e2b]">
            {filteredLeaks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center">
                  <p className="text-xs text-slate-400 font-mono">No carbon leak anomalies matched your filter criteria.</p>
                </td>
              </tr>
            ) : (
              filteredLeaks.map((leak) => (
                <tr key={leak.id} className="hover:bg-[#151a24]/60 transition-colors">
                  <td className="py-3 pr-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-100">{leak.equipment}</span>
                      <span className="text-[10px] font-mono text-slate-400">{leak.id} • {leak.location}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-300">{leak.process}</td>
                  <td className="py-3 font-mono text-slate-400">
                    <span className="text-slate-200">{leak.abnormal_period}</span>
                    <span className="block text-[10px] text-slate-400">Status: {leak.production_status}</span>
                  </td>
                  <td className="py-3 text-right font-mono font-semibold text-red-400">
                    +{leak.deviation_percent}%
                  </td>
                  <td className="py-3 text-right">
                    <LeakRiskBadge score={leak.risk_score} level={leak.risk_level} />
                  </td>
                  <td className="py-3 text-right">
                    <Link to={`/leaks/${leak.id}`}>
                      <Button variant="secondary" size="sm" icon={ArrowRight}>
                        Diagnose
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
