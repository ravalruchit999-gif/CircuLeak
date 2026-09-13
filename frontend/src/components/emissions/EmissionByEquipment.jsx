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
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <XAxis type="number" unit=" kg" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="displayName"
              tick={{ fill: '#cbd5e1', fontSize: 11 }}
              width={180}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
              contentStyle={customTooltipStyle}
              itemStyle={{ color: '#38bdf8', fontWeight: 600 }}
              labelStyle={{ color: '#f8fafc', fontWeight: 600, marginBottom: '4px' }}
              formatter={(val) => [`${val.toLocaleString()} kgCO₂e`, 'Emissions']}
            />
            <Bar dataKey="emissions_kg" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry) => {
                const isCritical = entry.is_anomaly || entry.flagged || entry.percentage >= 30;
                const isAmber = !isCritical && entry.percentage >= 15;
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
