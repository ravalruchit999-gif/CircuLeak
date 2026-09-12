import { useState, useEffect, useCallback } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getAuditSummary } from '../services/auditApi';
import { generateReport } from '../services/reportApi';

export function useAudit() {
  const { currentFacilityId } = useFacilityContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [reportResult, setReportResult] = useState(null);

  const fetchAudit = useCallback(async () => {
    if (!currentFacilityId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getAuditSummary(currentFacilityId);
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Unable to generate AI audit memorandum');
    } finally {
      setLoading(false);
    }
  }, [currentFacilityId]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  const requestReport = async (format = 'pdf') => {
    setGenerating(true);
    try {
      const res = await generateReport(currentFacilityId, format);
      setReportResult(res.data);
      return res.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  return { data, loading, generating, reportResult, error, refetch: fetchAudit, requestReport };
}
