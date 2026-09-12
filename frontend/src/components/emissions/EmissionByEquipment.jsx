import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { SectionCard } from '../ui/SectionCard';
import { customTooltipStyle } from '../../utils/chartHelpers';

export function EmissionByEquipment({ equipment = [] }) {
  const chartData = equipment.map((entry) => ({
    ...entry,
    displayName: entry.equipment || entry.name,
  }));

  return (
    <SectionCard
      title="Equipment Emission Ranking"
      subtitle="Ranked contribution across machinery with flagged equipment highlighted"
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height={256}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 70, bottom: 0 }}>
            <XAxis type="number" unit=" kg" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis type="category" dataKey="displayName" tick={{ fill: '#cbd5e1', fontSize: 11 }} width={120} />
            <Tooltip
              contentStyle={customTooltipStyle}
              formatter={(val) => [`${val.toLocaleString()} kgCO₂e`, 'Emissions']}
            />
            <Bar dataKey="emissions_kg" radius={[0, 4, 4, 0]}>
              {chartData.map((entry) => {
                const isCritical = entry.displayName?.includes('Compressor 03');
                const isAmber = entry.displayName?.includes('Furnace Line 2') || entry.displayName?.includes('Boiler');
                return (
                  <Cell
                    key={entry.displayName}
                    fill={
                      isCritical
                        ? '#ef4444' // Red for flagged leak
                        : isAmber
                        ? '#f59e0b' // Amber for heavy loss
                        : '#3b82f6'
                    }
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-end gap-4 mt-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-red-500" />
          <span>Flagged Critical Leak</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-amber-500" />
          <span>High Loss Anomaly</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-blue-500" />
          <span>Baseline</span>
        </div>
      </div>
    </SectionCard>
  );
}
