import { useState, useEffect } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getFacility, createOrUpdateFacility } from '../services/facilityApi';

export function useFacility() {
  const { currentFacilityId, isMockMode, setLiveApiError } = useFacilityContext();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFacility = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getFacility(currentFacilityId);
      setFacility(response.data);
      setLiveApiError(null);
    } catch (err) {
      setError(err.message || 'Failed to load facility profile');
      setLiveApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacility();
  }, [currentFacilityId, isMockMode]);

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
