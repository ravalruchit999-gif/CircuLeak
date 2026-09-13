import React from 'react';
import { Button } from '../ui/Button';
import { FileDown, Eye } from 'lucide-react';

export function ReportActions({ onGeneratePdf, onPreview, loading }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 no-print">
      <Button
        variant="secondary"
        size="sm"
        loading={loading}
        onClick={onPreview}
        icon={Eye}
      >
        Preview Full Report
      </Button>

      <Button
        variant="primary"
        size="sm"
        loading={loading}
        onClick={onGeneratePdf}
        icon={FileDown}
      >
        Download Audit PDF
      </Button>
    </div>
  );
}
