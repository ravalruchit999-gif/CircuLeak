import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { useAudit } from '../hooks/useAudit';
import { AuditSummary } from '../components/audit/AuditSummary';
import { AuditFindings } from '../components/audit/AuditFindings';
import { AuditRecommendations } from '../components/audit/AuditRecommendations';
import { ReportActions } from '../components/audit/ReportActions';
import { SectionCard } from '../components/ui/SectionCard';
import { CheckCircle2, ShieldCheck, Download, FileText } from 'lucide-react';
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

  const hasData = data && data.has_data;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Industrial Decarbonization Audit Memorandum"
          subtitle="Formal consulting memorandum summarizing plant baseline, verified carbon leaks, circular solutions, and capital payback"
        />
        <EmptyState
          icon={FileText}
          title="Audit Memorandum Unavailable"
          description="Executive audit certification requires verified operational logs. Ingest electricity meter readings, fuel batch logs, and machinery telemetry to compile this memorandum."
          actionText="Upload Facility Telemetry"
          actionLink="/upload"
        />
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
            {data.regulatory_ccts_standing || 'Verified Audit'}
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
      {data.key_findings && data.key_findings.length > 0 && (
        <AuditFindings findings={data.key_findings} />
      )}

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

      {/* PDF Download Preview Modal */}
      {isPreviewOpen && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Generated Decarbonization Audit Document"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              The formal executive decarbonization memorandum has been compiled with ISO 14064 GHG verification standards and national CEA emission factors.
            </p>

            <div className="p-3 rounded bg-[#121620] border border-[#232c3d] font-mono text-[11px] space-y-1">
              <div><strong>Document Reference:</strong> {data?.audit_id || 'AUD-2026'}</div>
              <div><strong>Facility:</strong> {data?.facility_name}</div>
              <div><strong>Certified Auditor:</strong> {data?.lead_auditor}</div>
              <div><strong>Format:</strong> High-Resolution Consulting PDF (12 Sections)</div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </Button>
              {reportResult?.download_url && (
                <a
                  href={reportResult.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Button variant="primary" size="sm" icon={Download}>
                    Download Document PDF
                  </Button>
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
export default AuditReport;
