import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, FileCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionCard } from '../ui/SectionCard';
import { Button } from '../ui/Button';

export function IncidentDataQuality({ dataQuality }) {
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  if (!dataQuality) return null;

  const available = Array.isArray(dataQuality.available) ? dataQuality.available : [];
  const missing = Array.isArray(dataQuality.missing) ? dataQuality.missing : [];
  const note =
    dataQuality.limitation_note ||
    'Missing measurements may limit the ability to determine the operational cause of this incident.';

  return (
    <SectionCard
      title="DATA QUALITY & TELEMETRY OBSERVABILITY"
      subtitle="Evaluated sensor coverage and measurement availability for this incident"
      className="mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Available Data */}
        <div className="p-4 rounded-lg bg-[#131924] border border-[#1f283a]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            DATA AVAILABLE ({available.length})
          </h4>
          <div className="space-y-2">
            {available.length > 0 ? (
              available.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-slate-200 font-mono"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500 font-mono">No telemetry points recorded</span>
            )}
          </div>
        </div>

        {/* Missing Data */}
        <div className="p-4 rounded-lg bg-[#18151f] border border-[#30222e]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            DATA MISSING ({missing.length})
          </h4>
          <div className="space-y-2">
            {missing.length > 0 ? (
              missing.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-slate-300 font-mono"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-emerald-400 font-mono">Full telemetry coverage available</span>
            )}
          </div>
        </div>
      </div>

      {/* Limitation Narrative & CTA */}
      <div className="p-3.5 rounded-lg bg-[#11141c] border border-[#1c2230] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          {note}
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowChecklistModal(true)}
          className="shrink-0 text-xs font-mono"
          icon={FileCheck}
        >
          View Required Measurements
        </Button>
      </div>

      {/* Modal for Measurement Checklist */}
      {showChecklistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#151a26] border border-[#263145] rounded-xl p-5 max-w-lg w-full shadow-2xl">
            <h3 className="text-sm font-semibold text-white mb-2 font-mono flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Required Industrial Measurement Checklist
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              To elevate incident detection into definitive physical root-cause verification, consider configuring these telemetry feeds in your facility data ingestion pipeline:
            </p>

            <div className="space-y-2 mb-5 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#0d1017] border border-[#1f283a]">
                <strong className="text-amber-400 block mb-0.5">High Priority: Process Temperature</strong>
                <span className="text-slate-400 text-[11px]">
                  Thermocouple/RTD telemetry allows thermal loss calculation and distinguishes insulation wear from electrical heater faults.
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#0d1017] border border-[#1f283a]">
                <strong className="text-amber-400 block mb-0.5">High Priority: Operating Line Pressure</strong>
                <span className="text-slate-400 text-[11px]">
                  Differential pressure telemetry verifies compressor bleed and leak rate vs baseline distribution losses.
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#0d1017] border border-[#1f283a]">
                <strong className="text-slate-300 block mb-0.5">Medium Priority: Direct Sub-Meter Feed</strong>
                <span className="text-slate-400 text-[11px]">
                  Direct IoT energy meters isolate the specific motor / heating element from auxiliary facility loads.
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Link to="/data-upload">
                <Button variant="outline" size="sm" icon={ArrowRight}>
                  Go to Data Upload
                </Button>
              </Link>
              <Button variant="primary" size="sm" onClick={() => setShowChecklistModal(false)}>
                Close Checklist
              </Button>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
