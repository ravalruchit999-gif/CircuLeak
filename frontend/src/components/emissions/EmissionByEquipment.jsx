import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { SectionCard } from '../ui/SectionCard';
import { customTooltipStyle } from '../../utils/chartHelpers';

export function EmissionByEquipment({ equipment = [] }) {
  return (
    <SectionCard
      title="Equipment Emission Ranking"
      subtitle="Ranked contribution across machinery with flagged equipment highlighted"
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={equipment} layout="vertical" margin={{ top: 10, right: 30, left: 70, bottom: 0 }}>
            <XAxis type="number" unit=" kg" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis type="category" dataKey="equipment" tick={{ fill: '#cbd5e1', fontSize: 11 }} width={120} />
            <Tooltip
              contentStyle={customTooltipStyle}
              formatter={(val) => [`${val.toLocaleString()} kgCO₂e`, 'Emissions']}
            />
            <Bar dataKey="emissions_kg" radius={[0, 4, 4, 0]}>
              {equipment.map((entry) => (
                <Cell
                  key={entry.equipment}
                  fill={
                    entry.equipment === 'Compressor 03'
                      ? '#ef4444' // Red for flagged leak
                      : entry.equipment === 'Furnace Line 2'
                      ? '#f59e0b' // Amber for heavy loss
                      : '#3b82f6'
                  }
                />
              ))}
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
