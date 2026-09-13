import { useState, useEffect, useCallback } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getCircularity } from '../services/circularityApi';
import { getSymbiosis } from '../services/symbiosisApi';

export function useCircularity() {
  const { currentFacilityId } = useFacilityContext();
  const [data, setData] = useState(null);
  const [symbiosisData, setSymbiosisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCircularity = useCallback(async () => {
    if (!currentFacilityId) {
      setData(null);
      setSymbiosisData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [circRes, symbRes] = await Promise.all([
        getCircularity(currentFacilityId),
        getSymbiosis(currentFacilityId).catch(() => ({ data: null })),
      ]);
      setData(circRes.data);
      setSymbiosisData(symbRes?.data || null);
    } catch (err) {
      setError(err.message || 'Unable to load circularity index');
    } finally {
      setLoading(false);
    }
  }, [currentFacilityId]);

  useEffect(() => {
    fetchCircularity();
  }, [fetchCircularity]);

  return { data, symbiosisData, loading, error, refetch: fetchCircularity };
}
