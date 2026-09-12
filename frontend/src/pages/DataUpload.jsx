import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { CsvUpload } from '../components/upload/CsvUpload';
import { SectionCard } from '../components/ui/SectionCard';
import { FileSpreadsheet, Download, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function DataUpload() {
  const downloadSampleCsv = () => {
    const csvContent =
      'date,hour,equipment,process,electricity_kwh,fuel_type,fuel_quantity,production_volume,operating_hours\n' +
      '2026-03-01,0,Air Compressor Unit 1,Compressed Air,48.5,electricity,0.0,22.0,1.0\n' +
      '2026-03-01,1,Air Compressor Unit 1,Compressed Air,52.1,electricity,0.0,20.0,1.0\n' +
      '2026-03-01,2,Air Compressor Unit 1,Compressed Air,50.4,electricity,0.0,18.0,1.0\n' +
      '2026-03-01,6,Melting Furnace 2,Induction Melting,120.0,natural gas,45.2,65.0,1.0\n' +
      '2026-03-01,7,Melting Furnace 2,Induction Melting,135.2,natural gas,50.0,72.0,1.0\n';

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
