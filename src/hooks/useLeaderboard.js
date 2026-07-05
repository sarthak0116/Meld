import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

/**
 * Fetches the top players sorted by MMR.
 * Polls every `intervalMs` milliseconds (default 30s).
 * Returns { players, loading, error, refresh }
 */
export default function useLeaderboard(limit = 10, intervalMs = 30_000) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await api(`/leaderboard?limit=${limit}`);
      setPlayers(data.players);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Initial load
  useEffect(() => { fetch(true); }, [fetch]);

  // Polling
  useEffect(() => {
    const id = setInterval(() => fetch(false), intervalMs);
    return () => clearInterval(id);
  }, [fetch, intervalMs]);

  return { players, loading, error, refresh: () => fetch(false) };
}
