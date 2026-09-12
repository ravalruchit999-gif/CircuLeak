import { useState, useEffect, useCallback } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getTrajectory } from '../services/trajectoryApi';

export function useTrajectory() {
  const { currentFacilityId } = useFacilityContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrajectory = useCallback(async () => {
    if (!currentFacilityId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getTrajectory(currentFacilityId);
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Unable to load decarbonization trajectory');
    } finally {
      setLoading(false);
    }
  }, [currentFacilityId]);

  useEffect(() => {
    fetchTrajectory();
  }, [fetchTrajectory]);

  return { data, loading, error, refetch: fetchTrajectory };
}
