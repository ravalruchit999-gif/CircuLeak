import { useState, useEffect } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getEmissionsBreakdown } from '../services/emissionsApi';

export function useEmissions() {
  const { currentFacilityId, isMockMode, setLiveApiError } = useFacilityContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getEmissionsBreakdown(currentFacilityId);
      setData(response.data);
      setLiveApiError(null);
    } catch (err) {
      setError(err.message || 'Unable to load emission intelligence');
      setLiveApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmissions();
  }, [currentFacilityId, isMockMode]);

  return { data, loading, error, refetch: fetchEmissions };
}
