import { useState, useEffect } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { dashboardMock } from '../data/dashboardMock';
import { getEmissionsSummary } from '../services/emissionsApi';
import { isMockModeActive } from '../services/apiClient';

export function useDashboard() {
  const { currentFacilityId, isMockMode, setLiveApiError } = useFacilityContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isMockModeActive()) {
        await new Promise((r) => setTimeout(r, 120));
        setData(dashboardMock);
      } else {
        const response = await getEmissionsSummary(currentFacilityId);
        // Compose live dashboard structure
        setData({
          facility_id: currentFacilityId,
          metrics: response.data,
          top_hotspots: dashboardMock.top_hotspots,
          anomalies_summary: dashboardMock.anomalies_summary,
          emission_sources: dashboardMock.emission_sources,
          top_recommended_action: dashboardMock.top_recommended_action,
        });
      }
      setLiveApiError(null);
    } catch (err) {
      setError(err.message || 'Unable to load executive dashboard data');
      setLiveApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [currentFacilityId, isMockMode]);

  return { data, loading, error, refetch: fetchDashboard };
}
