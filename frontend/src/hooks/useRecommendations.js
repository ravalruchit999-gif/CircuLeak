import { useState, useEffect } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getRecommendations } from '../services/recommendationsApi';

export function useRecommendations() {
  const { currentFacilityId, isMockMode, setLiveApiError } = useFacilityContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRecommendations(currentFacilityId);
      setData(response.data);
      setLiveApiError(null);
    } catch (err) {
      setError(err.message || 'Unable to load circular recommendations');
      setLiveApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [currentFacilityId, isMockMode]);

  return { data, loading, error, refetch: fetchRecommendations };
}
