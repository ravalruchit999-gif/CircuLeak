import { useState, useEffect, useCallback } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getLeakAnomalies, getLeakById } from '../services/leaksApi';

export function useLeaks(selectedLeakId = null) {
  const { currentFacilityId } = useFacilityContext();
  const [leaksData, setLeaksData] = useState(null);
  const [selectedLeak, setSelectedLeak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaks = useCallback(async () => {
    if (!currentFacilityId && !selectedLeakId) {
      setLeaksData(null);
      setSelectedLeak(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (selectedLeakId) {
        const response = await getLeakById(selectedLeakId, currentFacilityId);
        setSelectedLeak(response.data);
      } else {
        const response = await getLeakAnomalies(currentFacilityId);
        setLeaksData(response.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load carbon leak anomalies');
    } finally {
      setLoading(false);
    }
  }, [currentFacilityId, selectedLeakId]);

  useEffect(() => {
    fetchLeaks();
  }, [fetchLeaks]);

  return { leaksData, selectedLeak, loading, error, refetch: fetchLeaks };
}
