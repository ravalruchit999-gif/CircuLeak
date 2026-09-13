import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Clock, MapPin, Cpu, Activity, AlertOctagon, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

export function IncidentHeader({ incident, onStatusChange, mutationLoading }) {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState(null);
  const [note, setNote] = useState('');

  if (!incident) return null;

  const status = (incident.status || 'detected').toLowerCase();
  const severity = (incident.severity || 'Medium').toLowerCase();

  const getSeverityBadge = () => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-800 animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            CRITICAL SEVERITY
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            HIGH SEVERITY
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            LOW SEVERITY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-800">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            MEDIUM SEVERITY
          </span>
        );
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'investigating':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Investigating
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Resolved
          </span>
        );
      case 'dismissed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            Dismissed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-300 border border-red-500/30">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            Detected
          </span>
        );
    }
  };

  const handleTriggerAction = (newStatus) => {
    setTargetStatus(newStatus);
    setShowNoteModal(true);
  };

  const confirmAction = () => {
    if (targetStatus && onStatusChange) {
      onStatusChange(targetStatus, note);
    }
    setShowNoteModal(false);
    setNote('');
  };

  const detectedDateStr = incident.detected_at
    ? new Date(incident.detected_at).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Unavailable';

  return (
    <div className="bg-[#121620] border border-[#1e2536] rounded-xl p-6 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-[#1e2536]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
              CARBON INCIDENT #{String(incident.id).padStart(3, '0')}
            </h1>
            {getSeverityBadge()}
            {getStatusBadge()}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Detected: <strong className="text-slate-300">{detectedDateStr}</strong>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              Facility: <strong className="text-slate-300">{incident.facility_name || 'Unavailable'}</strong>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              Asset: <strong className="text-slate-300">{incident.equipment || 'Unavailable'}</strong>
            </span>
            <span className="text-slate-700">•</span>
            <span>
              Process Area: <strong className="text-slate-300">{incident.process_area || 'Unavailable'}</strong>
            </span>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2">
          {status !== 'investigating' && (
            <Button
              variant="outline"
              size="sm"
              disabled={mutationLoading}
              onClick={() => handleTriggerAction('investigating')}
              className="text-amber-400 border-amber-900/60 hover:bg-amber-950/30"
            >
              Mark Investigating
            </Button>
          )}

          {status !== 'resolved' && (
            <Button
              variant="outline"
              size="sm"
              disabled={mutationLoading}
              onClick={() => handleTriggerAction('resolved')}
              className="text-emerald-400 border-emerald-900/60 hover:bg-emerald-950/30"
            >
              Mark Resolved
            </Button>
          )}

          {status !== 'dismissed' && (
            <Button
              variant="outline"
              size="sm"
              disabled={mutationLoading}
              onClick={() => handleTriggerAction('dismissed')}
              className="text-slate-400 border-slate-800 hover:bg-slate-900"
            >
              Dismiss
            </Button>
          )}

          {status !== 'detected' && (
            <Button
              variant="ghost"
              size="sm"
              disabled={mutationLoading}
              onClick={() => handleTriggerAction('detected')}
              className="text-slate-500 hover:text-slate-300 text-xs"
              icon={RotateCcw}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#151a26] border border-[#263145] rounded-xl p-5 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-semibold text-white mb-2">
              Transition Carbon Incident to{' '}
              <span className="uppercase text-amber-400 font-mono">{targetStatus}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Provide an engineering or operational rationale for this status update. This action is permanently audited.
            </p>
            <textarea
              className="w-full h-24 bg-[#0d1017] border border-[#21293a] rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono mb-4"
              placeholder="e.g., Technician inspecting secondary heat exchanger seals..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNoteModal(false);
                  setNote('');
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={confirmAction}>
                Confirm Transition
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
