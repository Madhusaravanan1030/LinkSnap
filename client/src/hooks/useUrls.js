import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useUrls() {
  const [urls,    setUrls]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    api.get('/urls')
      .then((res) => setUrls(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load URLs'))
      .finally(() => setLoading(false));
  }, []);

  function addUrl(newUrl) {
    setUrls((prev) => [newUrl, ...prev]);
  }

  async function deleteUrl(id) {
    await api.delete(`/urls/${id}`);
    setUrls((prev) => prev.filter((u) => u._id !== id));
  }

  async function updateUrl(id, originalUrl) {
    const res = await api.patch(`/urls/${id}`, { originalUrl });
    setUrls((prev) => prev.map((u) => (u._id === id ? res.data : u)));
    return res.data;
  }

  return { urls, loading, error, addUrl, deleteUrl, updateUrl };
}
