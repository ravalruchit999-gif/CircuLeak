import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { CsvUpload } from '../components/upload/CsvUpload';
import { SectionCard } from '../components/ui/SectionCard';
import { FileSpreadsheet, Download, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function DataUpload() {
  const downloadSampleCsv = () => {
    const csvContent =
      'timestamp,equipment_id,energy_source,consumption,production_status\n' +
      '2026-02-10 00:00,COMPRESSOR-03,Electricity,61.2,inactive\n' +
      '2026-02-10 01:00,COMPRESSOR-03,Electricity,60.8,inactive\n' +
      '2026-02-10 02:00,COMPRESSOR-03,Electricity,62.1,inactive\n' +
      '2026-02-10 06:00,FURNACE-02,Natural Gas,614.5,active\n' +
      '2026-02-10 07:00,FURNACE-02,Natural Gas,612.0,active\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'circuleak_sample_process_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Industrial Data Ingestion & Verification"
        subtitle="Upload time-series process logs to detect unloader leaks, heat dissipation flaws, and operational anomalies"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={downloadSampleCsv}
            icon={Download}
          >
            Download Sample CSV
          </Button>
        }
      />

      <CsvUpload />
    </div>
  );
}
export default DataUpload;
