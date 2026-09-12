import { useState, useEffect } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getBenchmark, getPeerCluster } from '../services/benchmarkApi';

export function useBenchmark() {
  const { currentFacilityId, isMockMode, setLiveApiError } = useFacilityContext();
  const [industryBenchmark, setIndustryBenchmark] = useState(null);
  const [peerCluster, setPeerCluster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBenchmarkData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bRes, cRes] = await Promise.all([
        getBenchmark(currentFacilityId),
        getPeerCluster(currentFacilityId),
      ]);
      setIndustryBenchmark(bRes.data);
      setPeerCluster(cRes.data);
      setLiveApiError(null);
    } catch (err) {
      setError(err.message || 'Unable to load benchmark data');
      setLiveApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarkData();
  }, [currentFacilityId, isMockMode]);

  return { industryBenchmark, peerCluster, loading, error, refetch: fetchBenchmarkData };
}
