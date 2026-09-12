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

      const rawMetrics = emissRes.status === 'fulfilled' ? emissRes.value?.data : null;
      const hotspots = spotsRes.status === 'fulfilled' ? spotsRes.value?.data?.hotspots || [] : [];
      const anomaliesData = anomRes.status === 'fulfilled' ? anomRes.value?.data : null;
      const recsData = recsRes.status === 'fulfilled' ? recsRes.value?.data : null;

      const hasTelemetry = rawMetrics && rawMetrics.total_emissions > 0;

      const totalExcess = anomaliesData?.aggregate_excess_emissions || 0;
      const activeAnomalies = anomaliesData?.total_leaks || (anomaliesData?.anomalies?.length || 0);
      const highSeverity = anomaliesData?.high_risk_count || (anomaliesData?.anomalies?.filter((a) => (a.risk_score || 0) >= 70).length || 0);

      const potentialReduction = recsData?.potential_co2_reduction_total ||
        recsData?.items?.reduce((sum, item) => sum + (item.co2_reduction || 0), 0) || 0;
      const totalSavings = recsData?.total_annual_savings ||
        recsData?.items?.reduce((sum, item) => sum + (item.annual_savings || 0), 0) || 0;
      const totalCapex = recsData?.total_investment ||
        recsData?.items?.reduce((sum, item) => sum + (item.investment || 0), 0) || 0;
      const paybackYears = recsData?.overall_payback_years || (totalSavings > 0 ? Number((totalCapex / totalSavings).toFixed(1)) : 0);
      const reductionPercent = rawMetrics?.total_emissions > 0
        ? Math.min(100, Math.round((potentialReduction / rawMetrics.total_emissions) * 100))
        : 0;

      const peakEquipment = anomaliesData?.anomalies?.[0]?.equipment ||
        (highSeverity > 0 ? 'High Loss Hotspot' : 'Nominal Operations');

      const enrichedMetrics = rawMetrics ? {
        ...rawMetrics,
        high_risk_count: highSeverity,
        leak_count: activeAnomalies,
        potential_reduction: Math.round(potentialReduction),
        potential_reduction_percent: reductionPercent,
        annual_savings: Math.round(totalSavings),
        investment_required: Math.round(totalCapex),
        payback_years: paybackYears,
        peak_anomaly_equipment: peakEquipment,
      } : null;

      const topHotspots = hotspots.slice(0, 3).map((h) => ({
        equipment: h.equipment,
        process: h.process,
        daily_emissions: Math.round(h.emissions_kg ?? h.total_emissions ?? h.daily_emissions ?? 0),
        share_percent: Math.round(h.percentage_of_total ?? h.share_percent ?? 0),
        status: (h.percentage_of_total || 0) > 30 ? 'CRITICAL' : 'ELEVATED',
      }));

      const topRec = recsData?.items?.[0] || null;

      setData({
        facility_id: currentFacilityId,
        has_data: hasTelemetry,
        metrics: enrichedMetrics,
        top_hotspots: topHotspots,
        anomalies_summary: {
          active_anomalies: activeAnomalies,
          high_severity: highSeverity,
          total_excess_kg: totalExcess,
        },
        emission_sources: rawMetrics?.by_source || [],
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
