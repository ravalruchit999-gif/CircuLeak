import React, { createContext, useContext, useState, useEffect } from 'react';
import { isMockModeActive, setRuntimeMockMode } from '../services/apiClient';

const FacilityContext = createContext(null);

export function FacilityProvider({ children }) {
  const [currentFacilityId, setCurrentFacilityId] = useState('FAC-8842');
  const [facilityName, setFacilityName] = useState('Apex Metals & Casting Unit 4');
  const [isMockMode, setIsMockMode] = useState(isMockModeActive());
  const [liveApiError, setLiveApiError] = useState(null);

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
