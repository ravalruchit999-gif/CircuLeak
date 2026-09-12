import { useState, useEffect } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getTrajectory } from '../services/trajectoryApi';

export function useTrajectory() {
  const { currentFacilityId, isMockMode, setLiveApiError } = useFacilityContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrajectory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTrajectory(currentFacilityId);
      setData(response.data);
      setLiveApiError(null);
    } catch (err) {
      setError(err.message || 'Unable to load decarbonization trajectory');
      setLiveApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrajectory();
  }, [currentFacilityId, isMockMode]);

  return { data, loading, error, refetch: fetchTrajectory };
}
