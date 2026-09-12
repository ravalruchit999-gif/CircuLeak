import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export function UploadDropzone({ onFileSelected, isUploading }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragover' || e.type === 'dragenter') {
      setIsDragOver(true);
    } else if (e.type === 'dragleave') {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      onFileSelected(file);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      onFileSelected(file);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded p-8 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-950/20'
            : 'border-[#293245] bg-[#12161f] hover:border-slate-500'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleChange}
        />

        <div className="w-12 h-12 rounded-full bg-[#1b2230] border border-[#2b364c] flex items-center justify-center text-slate-300 mx-auto mb-3">
          <UploadCloud className="w-6 h-6 text-emerald-400" />
        </div>

        {fileName ? (
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-300">
              <FileText className="w-4 h-4" />
              <span>{fileName}</span>
            </div>
            <p className="text-xs text-slate-400">Click or drag another file to replace</p>
          </div>
        ) : (
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-200">
              Drop industrial operational CSV here, or browse
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Accepts hourly machine-level sub-metering, fuel batch logs, or compressed air telemetry
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            loading={isUploading}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Select CSV File
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              const sampleFile = new File(['sample'], 'apex_unit4_q1_process_telemetry.csv', { type: 'text/csv' });
              setFileName(sampleFile.name);
              onFileSelected(sampleFile);
            }}
          >
            Load Sample Batch (8,760 Rows)
          </Button>
        </div>
      </div>

      {/* Required Column Guidance */}
      <div className="p-4 rounded bg-[#151923] border border-[#212735] text-xs">
        <h5 className="font-semibold text-slate-200 uppercase tracking-wider mb-2 text-[11px]">
          Required CSV Data Schema
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono text-slate-400">
          <div className="p-2 rounded bg-[#10131a] border border-[#1e2433]">
            <span className="text-slate-200 font-semibold block">timestamp</span>
            <span className="text-[10px]">YYYY-MM-DD HH:MM</span>
          </div>
          <div className="p-2 rounded bg-[#10131a] border border-[#1e2433]">
            <span className="text-slate-200 font-semibold block">equipment_id</span>
            <span className="text-[10px]">e.g. COMPRESSOR-03</span>
          </div>
          <div className="p-2 rounded bg-[#10131a] border border-[#1e2433]">
            <span className="text-slate-200 font-semibold block">energy_source</span>
            <span className="text-[10px]">Electricity, Gas, Diesel</span>
          </div>
          <div className="p-2 rounded bg-[#10131a] border border-[#1e2433]">
            <span className="text-slate-200 font-semibold block">consumption</span>
            <span className="text-[10px]">Numeric value (kWh / SCM)</span>
          </div>
          <div className="p-2 rounded bg-[#10131a] border border-[#1e2433]">
            <span className="text-slate-200 font-semibold block">production_status</span>
            <span className="text-[10px]">active / inactive</span>
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry & Fieldbus Connector Channels */}
      <div className="p-4 rounded bg-[#121620] border border-[#1f2638] text-xs">
        <div className="flex items-center justify-between mb-3 border-b border-[#1c2331] pb-2">
          <div>
            <h5 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              Live SCADA & IoT Fieldbus Streaming Feeds
            </h5>
            <span className="text-[11px] text-slate-400">
              Hardware submetering endpoints ready for direct streaming ingestion
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
            4 Channels Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded bg-[#151923] border border-[#212735]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-200 font-bold">COMPRESSOR-03</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[10px] text-slate-400 block">Protocol: Modbus TCP (Port 502)</span>
            <span className="text-[10px] text-emerald-400 block mt-1">Polling: 10s • 61.2 kWh draw</span>
          </div>

          <div className="p-2.5 rounded bg-[#151923] border border-[#212735]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-200 font-bold">FURNACE-LINE-2</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[10px] text-slate-400 block">Protocol: OPC-UA (Industrial)</span>
            <span className="text-[10px] text-emerald-400 block mt-1">Polling: 5s • 614 SCM gas</span>
          </div>

          <div className="p-2.5 rounded bg-[#151923] border border-[#212735]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-200 font-bold">COOLING-TOWER-01</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[10px] text-slate-400 block">Protocol: BACnet IP (MSTP)</span>
            <span className="text-[10px] text-emerald-400 block mt-1">Polling: 15s • 45 kW pump</span>
          </div>

          <div className="p-2.5 rounded bg-[#151923] border border-[#212735]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-200 font-bold">GRID-SUBSTATION</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[10px] text-slate-400 block">Protocol: DNP3 / IEC 61850</span>
            <span className="text-[10px] text-emerald-400 block mt-1">Polling: 1m • Class 0.2S</span>
          </div>
        </div>
      </div>
    </div>
  );
}
