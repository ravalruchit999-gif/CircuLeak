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
      // Direct backend download with proper Content-Disposition and fresh dynamic values
      const response = await fetch(`http://127.0.0.1:8000/api/upload/template?format=${format}&t=${Date.now()}`);
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
      // Fallback dynamic multi-day CSV generation with embedded unloader leak
      let csvContent = 'date,hour,equipment,process,electricity_kwh,fuel_type,fuel_quantity,production_volume,operating_hours\n';
      const today = new Date();
      for (let dayOffset = 2; dayOffset >= 0; dayOffset--) {
        const d = new Date(today);
        d.setDate(d.getDate() - dayOffset);
        const dateStr = d.toISOString().slice(0, 10);

        for (let hour = 0; hour < 24; hour++) {
          const isActive = hour >= 7 && hour <= 21;
          // 1. Primary Air Compressor (has unloader leak during off-hours)
          const compKwh = isActive ? (50 + Math.random() * 6).toFixed(1) : (35 + Math.random() * 5).toFixed(1);
          const compProd = isActive ? (18 + Math.random() * 5).toFixed(1) : '0';
          const compHrs = isActive ? '1' : '0';
          csvContent += `${dateStr},${hour},Primary Air Compressor,Compressed Air Utility,${compKwh},none,0,${compProd},${compHrs}\n`;

          // 2. Induction Melting Furnace
          const furnKwh = isActive ? (410 + Math.random() * 50).toFixed(1) : (20 + Math.random() * 8).toFixed(1);
          const furnFuel = isActive ? (34 + Math.random() * 8).toFixed(1) : (6 + Math.random() * 3).toFixed(1);
          const furnProd = isActive ? (23 + Math.random() * 5).toFixed(1) : '0';
          csvContent += `${dateStr},${hour},Induction Melting Furnace,Melting & Casting,${furnKwh},natural_gas,${furnFuel},${furnProd},${compHrs}\n`;

          // 3. Annealing Heat-Treat Oven
          const ovenKwh = (hour >= 8 && hour <= 20) ? (180 + Math.random() * 25).toFixed(1) : (8 + Math.random() * 4).toFixed(1);
          const ovenFuel = (hour >= 8 && hour <= 20) ? (18 + Math.random() * 4).toFixed(1) : '1.5';
          const ovenProd = (hour >= 8 && hour <= 20) ? (16 + Math.random() * 3).toFixed(1) : '0';
          csvContent += `${dateStr},${hour},Annealing Heat-Treat Oven,Thermal Processing,${ovenKwh},natural_gas,${ovenFuel},${ovenProd},${compHrs}\n`;

          // 4. Auxiliary Cooling Pumps
          const pumpKwh = (36 + Math.random() * 6).toFixed(1);
          csvContent += `${dateStr},${hour},Auxiliary Cooling Pumps,Cooling Water Loop,${pumpKwh},none,0,20,1\n`;
        }
      }

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
            <strong>Dynamic Telemetry:</strong> Generates fresh, randomized multi-day time-series logs (72+ hourly rows) with realistic unloader leaks and furnace profiles. Supports raw CSV (<code className="text-emerald-300">.csv</code>) and native Excel (<code className="text-emerald-300">.xlsx</code>).
          </span>
        </div>
        <span className="hidden md:inline font-mono text-[11px] text-emerald-400">
          Fresh Dataset Generated on Each Click
        </span>
      </div>

      <CsvUpload />
    </div>
  );
}
export default DataUpload;
