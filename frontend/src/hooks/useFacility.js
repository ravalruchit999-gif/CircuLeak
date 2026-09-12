import { useState, useEffect, useCallback } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getFacility, createOrUpdateFacility } from '../services/facilityApi';

export function useFacility() {
  const { currentFacilityId } = useFacilityContext();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFacility = useCallback(async () => {
    if (!currentFacilityId) {
      setFacility(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getFacility(currentFacilityId);
      setFacility(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load facility profile');
    } finally {
      setLoading(false);
    }
  }, [currentFacilityId]);

  useEffect(() => {
    fetchFacility();
  }, [fetchFacility]);

  const updateProfile = async (updatedData) => {
    try {
      const res = await createOrUpdateFacility(updatedData);
      setFacility(res.data);
      return res.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { facility, loading, error, refetch: fetchFacility, updateProfile };
}
