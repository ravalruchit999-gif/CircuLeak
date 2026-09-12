import { useState, useEffect, useCallback } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getCircularity } from '../services/circularityApi';

export function useCircularity() {
  const { currentFacilityId } = useFacilityContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCircularity = useCallback(async () => {
    if (!currentFacilityId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getCircularity(currentFacilityId);
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Unable to load circularity index');
    } finally {
      setLoading(false);
    }
  }, [currentFacilityId]);

  useEffect(() => {
    fetchCircularity();
  }, [fetchCircularity]);

  return { data, loading, error, refetch: fetchCircularity };
}
