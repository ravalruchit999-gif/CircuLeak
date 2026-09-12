import React, { createContext, useContext, useState, useEffect } from 'react';
import { isMockModeActive, setRuntimeMockMode } from '../services/apiClient';
import { useAuth } from './AuthContext';

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
    return 'FAC-8842';
  });

  const [facilityName, setFacilityName] = useState(() => {
    try {
      const saved = localStorage.getItem('circuleak_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.company_name) return u.company_name;
      }
    } catch {}
    return 'Apex Metals & Casting Unit 4';
  });

  const [isMockMode, setIsMockMode] = useState(isMockModeActive());
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

  const toggleMockMode = (forceValue) => {
    const nextMode = forceValue !== undefined ? forceValue : !isMockMode;
    setIsMockMode(nextMode);
    setRuntimeMockMode(nextMode);
    if (nextMode) {
      // clear error when manually switching to demo mode
      setLiveApiError(null);
    }
  };

  return (
    <FacilityContext.Provider
      value={{
        currentFacilityId,
        setCurrentFacilityId,
        facilityName,
        setFacilityName,
        isMockMode,
        toggleMockMode,
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
