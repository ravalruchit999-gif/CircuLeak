import React from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { CsvUpload } from '../components/upload/CsvUpload';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function DataUpload() {
  const downloadTemplate = async (format = 'csv') => {
    const isXlsx = format === 'xlsx';
    const filename = isXlsx ? 'circuleak_telemetry_template.xlsx' : 'circuleak_telemetry_template.csv';

    try {
      // Direct backend download with proper Content-Disposition and MIME headers
      const response = await fetch(`http://127.0.0.1:8000/api/upload/template?format=${format}`);
      if (!response.ok) throw new Error('Backend template request failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback direct CSV blob generation
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
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Industrial Data Ingestion & Verification"
        subtitle="Upload time-series process logs to detect unloader leaks, heat dissipation flaws, and operational anomalies"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadTemplate('csv')}
              icon={Download}
            >
              Download Sample CSV (.csv)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => downloadTemplate('xlsx')}
              icon={FileSpreadsheet}
            >
              Download Excel Template (.xlsx)
            </Button>
          </div>
        }
      />

      <div className="p-3 rounded bg-[#121620] border border-[#1f2738] flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Spreadsheet Compatibility:</strong> Both raw CSV (<code className="text-emerald-300">.csv</code>) and native Microsoft Excel (<code className="text-emerald-300">.xlsx</code>, <code className="text-emerald-300">.xls</code>) spreadsheets are parsed and validated automatically.
          </span>
        </div>
        <span className="hidden md:inline font-mono text-[11px] text-slate-500">
          Windows: .csv defaults to Excel icon
        </span>
      </div>

      <CsvUpload />
    </div>
  );
}
export default DataUpload;
