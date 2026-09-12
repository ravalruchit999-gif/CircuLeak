import { useState, useEffect, useCallback } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getBenchmark, getPeerCluster } from '../services/benchmarkApi';

export function useBenchmark() {
  const { currentFacilityId } = useFacilityContext();
  const [industryBenchmark, setIndustryBenchmark] = useState(null);
  const [peerCluster, setPeerCluster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBenchmarkData = useCallback(async () => {
    if (!currentFacilityId) {
      setIndustryBenchmark(null);
      setPeerCluster(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [bRes, cRes] = await Promise.all([
        getBenchmark(currentFacilityId),
        getPeerCluster(currentFacilityId),
      ]);
      setIndustryBenchmark(bRes.data);
      setPeerCluster(cRes.data);
    } catch (err) {
      setError(err.message || 'Unable to load benchmark data');
    } finally {
      setLoading(false);
    }
  }, [currentFacilityId]);

  useEffect(() => {
    fetchBenchmarkData();
  }, [fetchBenchmarkData]);

  return { industryBenchmark, peerCluster, loading, error, refetch: fetchBenchmarkData };
}
