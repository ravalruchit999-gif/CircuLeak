import { useState, useEffect, useCallback } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getEmissionsBreakdown } from '../services/emissionsApi';

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
      const response = await getEmissionsBreakdown(currentFacilityId);
      setData(response.data);
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
