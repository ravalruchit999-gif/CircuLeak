import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { useAudit } from '../hooks/useAudit';
import { AuditSummary } from '../components/audit/AuditSummary';
import { AuditFindings } from '../components/audit/AuditFindings';
import { AuditRecommendations } from '../components/audit/AuditRecommendations';
import { ReportActions } from '../components/audit/ReportActions';
import { SectionCard } from '../components/ui/SectionCard';
import { CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

export function AuditReport() {
  const { data, loading, generating, reportResult, error, refetch, requestReport } = useAudit();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (loading) {
    return (
      <div>
        <PageHeader title="Executive Decarbonization Audit Report" />
        <LoadingState rows={6} message="Generating executive consulting memorandum and audit findings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Executive Decarbonization Audit Report" />
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePdf = async () => {
    await requestReport('pdf');
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Industrial Decarbonization Audit Memorandum"
        subtitle="Formal consulting memorandum summarizing plant baseline, verified carbon leaks, circular solutions, and capital payback"
        badge={
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Certified Audit
          </span>
        }
        actions={
          <ReportActions
            onPrint={handlePrint}
            onPreview={() => setIsPreviewOpen(true)}
            onGeneratePdf={handleGeneratePdf}
            loading={generating}
          />
        }
      />

      {/* Generated Report Toast Confirmation (if triggered) */}
      {reportResult && (
        <div className="p-3.5 rounded bg-emerald-950/40 border border-emerald-800/80 text-xs flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{reportResult.message}</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            Timestamp: {new Date(reportResult.generated_at).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Executive Summary Memorandum */}
      <AuditSummary audit={data} />

      {/* Verified Anomaly Findings */}
      <AuditFindings findings={data?.key_findings} />

      {/* Recommendations & Investment Schedule */}
      <AuditRecommendations packageDetails={data?.recommended_package} />

      {/* Compliance & Verification Standards */}
      <SectionCard
        title="Regulatory Compliance & Standard Alignment"
        subtitle="Institutional benchmarks and certification frameworks satisfied by this diagnostic"
      >
        <div className="space-y-2">
          {data?.compliance_notes?.map((note, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded bg-[#141822] border border-[#212735]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Full Report Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Decarbonization Audit Report Document Preview"
        maxWidth="max-w-3xl"
      >
        <div className="p-4 bg-white text-slate-900 rounded space-y-4 font-sans text-xs">
          <div className="border-b border-slate-300 pb-3 flex justify-between items-start">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">CIRCULEAK AUDIT MEMORANDUM</h2>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mt-0.5">
                Ref: {data?.audit_id} • Prepared for Executive Board
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-800">{data?.facility_name}</span>
              <span className="text-[10px] text-slate-500 block">{data?.audit_date}</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">1. Executive Summary</h4>
            <p className="text-slate-700 leading-relaxed text-justify">{data?.executive_summary}</p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">2. Core Leak Findings</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              {data?.key_findings?.map((f, i) => (
                <li key={i}>
                  <strong>{f.category}:</strong> {f.finding} ({f.impact})
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1">3. Capital Recovery Schedule</h4>
            <div className="grid grid-cols-4 gap-2 p-2 bg-slate-100 rounded text-center font-mono text-[11px]">
              <div>
                <span className="text-slate-500 text-[10px] block">Capex</span>
                <strong>₹6,50,000</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Annual Savings</span>
                <strong className="text-emerald-700">₹4,20,000</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Payback</span>
                <strong>1.55 yrs</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">CO₂ Cut</span>
                <strong className="text-emerald-700">-3,150 kg/day</strong>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-300 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint} icon={Download}>
              Print / Save PDF
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default AuditReport;
