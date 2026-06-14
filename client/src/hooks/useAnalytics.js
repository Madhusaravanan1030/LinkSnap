import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useAnalytics(urlId) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!urlId) return;
    setLoading(true);
    api.get(`/urls/${urlId}/analytics`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [urlId]);

  return { data, loading, error };
}
