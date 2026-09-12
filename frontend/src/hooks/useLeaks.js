import { useState, useEffect } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getLeakAnomalies, getLeakById } from '../services/leaksApi';

export function useLeaks(selectedLeakId = null) {
  const { currentFacilityId, isMockMode, setLiveApiError } = useFacilityContext();
  const [leaksData, setLeaksData] = useState(null);
  const [selectedLeak, setSelectedLeak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaks = async () => {
    setLoading(true);
    setError(null);
    try {
      if (selectedLeakId) {
        const response = await getLeakById(selectedLeakId);
        setSelectedLeak(response.data);
      } else {
        const response = await getLeakAnomalies(currentFacilityId);
        setLeaksData(response.data);
      }
      setLiveApiError(null);
    } catch (err) {
      setError(err.message || 'Unable to load carbon leak anomalies');
      setLiveApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaks();
  }, [currentFacilityId, selectedLeakId, isMockMode]);

  return { leaksData, selectedLeak, loading, error, refetch: fetchLeaks };
}
