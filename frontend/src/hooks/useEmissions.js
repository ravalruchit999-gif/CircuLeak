import { useState, useEffect, useCallback } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getEmissionsSummary, getEmissionsBreakdown, getEmissionsTimeline } from '../services/emissionsApi';

export function useEmissions() {
  const { currentFacilityId } = useFacilityContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmissions = useCallback(async () => {
    if (!currentFacilityId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, breakdownRes, timelineRes] = await Promise.all([
        getEmissionsSummary(currentFacilityId).catch(() => null),
        getEmissionsBreakdown(currentFacilityId).catch(() => null),
        getEmissionsTimeline(currentFacilityId, 'daily').catch(() => null),
      ]);

      const summaryData = summaryRes?.data || {};
      const breakdownData = breakdownRes?.data || {};
      const timelinePoints = timelineRes?.data?.points || [];

      const totalEmissions = summaryData.total_emissions ?? breakdownData.total_emissions_kg ?? 0;

      const combined = {
        ...breakdownData,
        ...summaryData,
        total_emissions: totalEmissions,
        total_emissions_kg: breakdownData.total_emissions_kg ?? totalEmissions,
        total_emissions_tonnes: summaryData.total_emissions_tonnes ?? (totalEmissions / 1000),
        emissions_intensity: summaryData.emissions_intensity ?? 0,
        total_production_volume: summaryData.total_production_volume ?? 0,
        total_electricity_kwh: summaryData.total_electricity_kwh ?? 0,
        by_source: summaryData.by_source || breakdownData.by_source || [],
        by_process: summaryData.by_process || breakdownData.by_process || [],
        by_equipment: summaryData.by_equipment || breakdownData.by_equipment || [],
        timeline: timelinePoints.map((p) => ({
          ...p,
          day: p.date ? (p.date.length > 5 ? p.date.slice(5) : p.date) : (p.hour !== undefined ? `${p.hour}:00` : 'Day'),
          emissions: p.emissions_kg ?? p.actual ?? 0,
          baseline: p.baseline ?? 0,
        })),
      };

      setData(combined);
    } catch (err) {
      setError(err.message || 'Unable to load emission intelligence');
    } finally {
      setLoading(false);
    }
  }, [currentFacilityId]);

  useEffect(() => {
    fetchEmissions();
  }, [fetchEmissions]);

  return { data, loading, error, refetch: fetchEmissions };
}
