import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getFacility } from '../services/facilityApi';
import { getEmissionsSummary } from '../services/emissionsApi';

const FacilityContext = createContext(null);

export function FacilityProvider({ children }) {
  const { user } = useAuth();

  const [currentFacilityId, setCurrentFacilityId] = useState(() => {
    try {
      const saved = localStorage.getItem('circuleak_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.facility_id) return u.facility_id;
      }
    } catch {}
    return 1;
  });

  const [facilityName, setFacilityName] = useState(() => {
    try {
      const saved = localStorage.getItem('circuleak_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.company_name) return u.company_name;
      }
    } catch {}
    return 'Industrial Facility';
  });

  const [facilityDetails, setFacilityDetails] = useState(null);
  const [facilityMetrics, setFacilityMetrics] = useState(null);
  const [liveApiError, setLiveApiError] = useState(null);

  // Sync state when authenticated user updates
  useEffect(() => {
    if (user?.facility_id) {
      setCurrentFacilityId(user.facility_id);
    }
    if (user?.company_name) {
      setFacilityName(user.company_name);
    }
  }, [user]);

  const refreshFacilityData = useCallback(async () => {
    if (!currentFacilityId) return;
    try {
      const [facRes, emissRes] = await Promise.allSettled([
        getFacility(currentFacilityId),
        getEmissionsSummary(currentFacilityId),
      ]);

      if (facRes.status === 'fulfilled' && facRes.value?.data) {
        const fac = facRes.value.data;
        setFacilityDetails(fac);
        if (fac.business_name) {
          setFacilityName(fac.business_name);
        }
      }

      if (emissRes.status === 'fulfilled' && emissRes.value?.data) {
        setFacilityMetrics(emissRes.value.data);
      }

      setLiveApiError(null);
    } catch (err) {
      setLiveApiError(err.message);
    }
  }, [currentFacilityId]);

  useEffect(() => {
    refreshFacilityData();
  }, [refreshFacilityData]);

  return (
    <FacilityContext.Provider
      value={{
        currentFacilityId,
        setCurrentFacilityId,
        facilityName,
        setFacilityName,
        facilityDetails,
        facilityMetrics,
        refreshFacilityData,
        liveApiError,
        setLiveApiError,
      }}
    >
      {children}
    </FacilityContext.Provider>
  );
}

export function useFacilityContext() {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacilityContext must be used within a FacilityProvider');
  }
  return context;
}
