import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { CsvUpload } from '../components/upload/CsvUpload';
import { Download } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function DataUpload() {
  const downloadSampleCsv = () => {
    const csvContent =
      'date,hour,equipment,process,electricity_kwh,fuel_type,fuel_quantity,production_volume,operating_hours\n' +
      '2026-03-01,0,Primary Compressor,Compressed Air Utility,52.4,none,0,18.5,1\n' +
      '2026-03-01,1,Primary Compressor,Compressed Air Utility,51.8,none,0,18.0,1\n' +
      '2026-03-01,2,Primary Compressor,Compressed Air Utility,53.1,none,0,17.8,1\n' +
      '2026-03-01,3,Primary Compressor,Compressed Air Utility,52.0,none,0,18.2,1\n' +
      '2026-03-01,4,Induction Furnace,Melting & Casting,420.5,natural_gas,35.0,24.0,1\n' +
      '2026-03-01,5,Induction Furnace,Melting & Casting,435.0,natural_gas,36.2,25.0,1\n' +
      '2026-03-01,6,Annealing Oven,Thermal Processing,180.2,natural_gas,18.5,15.0,1\n' +
      '2026-03-01,7,Auxiliary Pumps,Cooling Water Loop,38.4,none,0,20.0,1\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'circuleak_telemetry_template.csv');
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
            Download Sample CSV Template
          </Button>
        }
      />

      <CsvUpload />
    </div>
  );
}
export default DataUpload;
