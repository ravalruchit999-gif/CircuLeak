import { useState, useEffect, useCallback } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getEmissionsSummary } from '../services/emissionsApi';
import { getCarbonHotspots, getLeakAnomalies } from '../services/leaksApi';
import { getRecommendations } from '../services/recommendationsApi';

export function useDashboard() {
  const { currentFacilityId } = useFacilityContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!currentFacilityId) {
      setData({
        facility_id: null,
        has_data: false,
        metrics: null,
        top_hotspots: [],
        anomalies_summary: { active_anomalies: 0, high_severity: 0, total_excess_kg: 0 },
        emission_sources: [],
        top_recommended_action: null,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [emissRes, spotsRes, anomRes, recsRes] = await Promise.allSettled([
        getEmissionsSummary(currentFacilityId),
        getCarbonHotspots(currentFacilityId),
        getLeakAnomalies(currentFacilityId),
        getRecommendations(currentFacilityId),
      ]);

      const metrics = emissRes.status === 'fulfilled' ? emissRes.value?.data : null;
      const hotspots = spotsRes.status === 'fulfilled' ? spotsRes.value?.data?.hotspots || [] : [];
      const anomaliesData = anomRes.status === 'fulfilled' ? anomRes.value?.data : null;
      const recsData = recsRes.status === 'fulfilled' ? recsRes.value?.data : null;

      const hasTelemetry = metrics && metrics.total_emissions > 0;

      const totalExcess = anomaliesData?.aggregate_excess_emissions || 0;
      const activeAnomalies = anomaliesData?.total_leaks || 0;
      const highSeverity = anomaliesData?.high_risk_count || 0;

      const topHotspots = hotspots.slice(0, 3).map((h) => ({
        equipment: h.equipment,
        process: h.process,
        daily_emissions: Math.round(h.total_emissions || 0),
        share_percent: Math.round(h.percentage_of_total || 0),
        status: h.percentage_of_total > 30 ? 'CRITICAL' : 'ELEVATED',
      }));

      const topRec = recsData?.items?.[0] || null;

      setData({
        facility_id: currentFacilityId,
        has_data: hasTelemetry,
        metrics,
        top_hotspots: topHotspots,
        anomalies_summary: {
          active_anomalies: activeAnomalies,
          high_severity: highSeverity,
          total_excess_kg: totalExcess,
        },
        emission_sources: metrics?.by_source || [],
        top_recommended_action: topRec ? {
          title: topRec.title,
          target_equipment: topRec.target_equipment,
          potential_co2_reduction: topRec.co2_reduction,
          annual_savings: topRec.annual_savings,
          payback_years: topRec.payback_years,
          effort: topRec.effort_level,
        } : null,
      });
    } catch (err) {
      setError(err.message || 'Unable to load executive dashboard data');
    } finally {
      setLoading(false);
    }
  }, [currentFacilityId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refetch: fetchDashboard };
}
