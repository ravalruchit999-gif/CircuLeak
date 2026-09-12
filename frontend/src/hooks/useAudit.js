import { useState, useEffect } from 'react';
import { useFacilityContext } from '../context/FacilityContext';
import { getAuditSummary } from '../services/auditApi';
import { generateReport } from '../services/reportApi';

export function useAudit() {
  const { currentFacilityId, isMockMode, setLiveApiError } = useFacilityContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [reportResult, setReportResult] = useState(null);

  const fetchAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAuditSummary(currentFacilityId);
      setData(response.data);
      setLiveApiError(null);
    } catch (err) {
      setError(err.message || 'Unable to generate AI audit memorandum');
      setLiveApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [currentFacilityId, isMockMode]);

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
