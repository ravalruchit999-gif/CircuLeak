import React from 'react';
import { Button } from '../ui/Button';
import { FileDown, Eye, Printer } from 'lucide-react';

export function ReportActions({ onGeneratePdf, onPreview, onPrint, loading }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 no-print">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrint}
        icon={Printer}
      >
        Print Memorandum
      </Button>

      <Button
        variant="secondary"
        size="sm"
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
        Generate Audit PDF
      </Button>
    </div>
  );
}
