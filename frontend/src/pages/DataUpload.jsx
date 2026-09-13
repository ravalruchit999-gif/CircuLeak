import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { CsvUpload } from '../components/upload/CsvUpload';
import { Download, FileSpreadsheet, Factory, CheckCircle2, Info, Layers } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useFacilityContext } from '../context/FacilityContext';

const SECTOR_METADATA = {
  'Automotive Component Casting': {
    slug: 'Automotive_Component_Casting',
    shortName: 'Automotive Casting',
    assets: 'HPDC Die Casting Cell (800T), Induction Melting, Solution & Aging Furnace, Shot Blasting, CNC Machining, Screw Air Compressor, Chiller Tower',
    fuel: 'Natural Gas & Grid Electricity',
    anomalies: 'Air compressor unloader leak, melting furnace coil degradation, aging furnace door seal heat loss',
  },
  'Alloy & Steel Fabrication': {
    slug: 'Alloy_Steel_Fabrication',
    shortName: 'Steel Fabrication',
    assets: 'Robotic GMAW Welding Gantry, CNC Plasma Table, Plate Bending Roll, PWHT Furnace, Wheelabrator Blast Room, Screw Compressor, Fume Exhaust',
    fuel: 'Natural Gas & Grid Electricity',
    anomalies: 'Off-hours airline distribution leaks, PWHT furnace air-fuel ratio drift, baghouse motor differential pressure overload',
  },
  'Metals & Heavy Alloys': {
    slug: 'Metals_Heavy_Alloys',
    shortName: 'Heavy Alloys',
    assets: '5T Induction Melting Furnace, Oxy-Fuel Ladle Pre-Heater, Continuous Billet Caster, Soaking Pit Reheating Furnace, 1200T Forging Press, Hydraulic Pack',
    fuel: 'Natural Gas & Grid Electricity',
    anomalies: 'Ladle heater excess idle firing, reheating furnace recuperator thermal leakage, hydraulic valve internal bypass',
  },
  'Textile & Garment Dyeing': {
    slug: 'Textile_Garment_Dyeing',
    shortName: 'Textile Dyeing',
    assets: 'HTHP Jet Dyeing #01, Soft Flow Jet #02, 8-Chamber Stenter Frame, Rotary Screen Printing, Industrial Steam Boiler, GA-75 Compressor, ETP Aeration',
    fuel: 'Natural Gas & Grid Electricity',
    anomalies: 'Circulation pump cavitation, stenter exhaust damper actuator failure, boiler blowdown valve steam leak',
  },
  'Cement & Lime Processing': {
    slug: 'Cement_Lime_Processing',
    shortName: 'Cement & Lime',
    assets: 'Rotary Calcination Kiln & Precalciner, Raw Ball Mill, Vertical Roller Finish Mill, Clinker Grate Cooler, Limestone Gyratory Crusher, Kiln ID Fan',
    fuel: 'Thermal Coal & Grid Electricity',
    anomalies: 'Precalciner tertiary air duct refractory dissipation, raw mill false air infiltration, pneumatic seal ring blowout',
  },
  'Chemical & Petrochemical': {
    slug: 'Chemical_Petrochemical',
    shortName: 'Chemical & Petrochem',
    assets: 'Catalytic Reforming Furnace, Distillation Column Reboiler, Exothermic Reactor, Boiler Feed Pump, Waste Heat Boiler, Gas Compressor, Brine Chiller',
    fuel: 'Natural Gas & Grid Electricity',
    anomalies: 'Distillation reboiler steam trap blow-through leak, reforming furnace combustion imbalance, compressor cylinder bypass',
  },
};

const SECTOR_OPTIONS = Object.keys(SECTOR_METADATA);

export function DataUpload() {
  const { facilityDetails } = useFacilityContext();

  const [selectedSector, setSelectedSector] = useState('Automotive Component Casting');

  useEffect(() => {
    if (facilityDetails?.sector) {
      const match = SECTOR_OPTIONS.find(
        (s) => s.toLowerCase() === facilityDetails.sector.toLowerCase()
      );
      if (match) {
        setSelectedSector(match);
      }
    }
  }, [facilityDetails]);

  const activeMeta = SECTOR_METADATA[selectedSector] || SECTOR_METADATA['Automotive Component Casting'];

  const downloadTemplate = async (format = 'xlsx') => {
    const isXlsx = format === 'xlsx';
    const ext = isXlsx ? 'xlsx' : 'csv';
    const filename = `${activeMeta.slug}_Telemetry.${ext}`;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/upload/template?sector=${encodeURIComponent(selectedSector)}&format=${format}&t=${Date.now()}`
      );
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
      // Fallback CSV generation
      let csvContent = 'timestamp,equipment,process,electricity_kwh,fuel_type,fuel_quantity,production_volume,operating_hours\n';
      const today = new Date();
      for (let dayOffset = 3; dayOffset >= 0; dayOffset--) {
        const d = new Date(today);
        d.setDate(d.getDate() - dayOffset);
        const dateStr = d.toISOString().slice(0, 10);

        for (let hour = 0; hour < 24; hour++) {
          const isActive = hour >= 6 && hour <= 22;
          const timeStr = `${dateStr} ${String(hour).padStart(2, '0')}:00:00`;
          const elec = isActive ? (45 + Math.random() * 8).toFixed(2) : (2.5 + Math.random() * 1).toFixed(2);
          const prod = isActive ? (380 + Math.random() * 30).toFixed(1) : '0';
          const hrs = isActive ? '1.0' : '0.0';
          csvContent += `${timeStr},HPDC Die Casting Cell #01,High Pressure Die Casting,${elec},none,0,${prod},${hrs}\n`;
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
          <div className="flex items-center flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadTemplate('csv')}
              icon={Download}
            >
              Download {activeMeta.shortName} (.csv)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => downloadTemplate('xlsx')}
              icon={FileSpreadsheet}
            >
              Download {activeMeta.shortName} (.xlsx)
            </Button>
          </div>
        }
      />

      {/* Sector Selection & Engineering Profile Card */}
      <div className="p-4 rounded-xl bg-[#121620] border border-[#1f2738] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2230]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-400">
              <Factory className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Target Manufacturing Sector
              </span>
              <span className="text-sm font-bold text-white tracking-tight">
                {selectedSector}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono hidden md:inline">Switch Sector:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-3 py-1.5 bg-[#171c26] border border-[#283244] rounded text-xs text-white focus:outline-none focus:border-emerald-500 font-sans cursor-pointer transition-colors"
            >
              {SECTOR_OPTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded bg-[#161a24] border border-[#232b3b]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Monitored Asset Catalog (7 Machines)
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2" title={activeMeta.assets}>
              {activeMeta.assets}
            </p>
          </div>

          <div className="p-2.5 rounded bg-[#161a24] border border-[#232b3b]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Fuel & Energy Carriers
            </span>
            <p className="text-slate-300 text-[11px]">
              {activeMeta.fuel}
            </p>
            <span className="text-[10px] text-emerald-400/80 font-mono block mt-1">
              14 Continuous Days (2,352 SCADA rows)
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#161a24] border border-[#232b3b]">
            <span className="text-[10px] text-amber-400/90 uppercase tracking-wider block mb-1">
              Simulated Carbon Leak Signatures
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2" title={activeMeta.anomalies}>
              {activeMeta.anomalies}
            </p>
          </div>
        </div>
      </div>

      <CsvUpload />
    </div>
  );
}
export default DataUpload;
