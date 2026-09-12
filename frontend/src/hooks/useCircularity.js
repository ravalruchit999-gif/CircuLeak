import { useState, useEffect } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getCircularity } from '../services/circularityApi';

export function useCircularity() {
  const { currentFacilityId, isMockMode, setLiveApiError } = useFacilityContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCircularity = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCircularity(currentFacilityId);
      setData(response.data);
      setLiveApiError(null);
    } catch (err) {
      setError(err.message || 'Unable to load circularity index');
      setLiveApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircularity();
  }, [currentFacilityId, isMockMode]);

  return { data, loading, error, refetch: fetchCircularity };
}
