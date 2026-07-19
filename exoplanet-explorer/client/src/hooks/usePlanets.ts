import { useState, useEffect, useCallback } from 'react';
import { fetchPlanets, fetchStats, checkHealth } from '../utils/api';
import type { Planet, PaginationInfo, StatsResponse, Filters } from '../types';

const WAKE_UP_TIMEOUT_MS = 90_000;

export function useServerWakeUp() {
  const [isWaking, setIsWaking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    const maxAttempts = 18; // 90s / 5s

    const poll = async () => {
      const ok = await checkHealth();
      if (!mounted) return;
      if (ok) {
        setIsOnline(true);
        setIsWaking(false);
      } else {
        attempts++;
        if (attempts === 1) setIsWaking(true);
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        }
      }
    };

    poll();
    return () => { mounted = false; };
  }, []);

  return { isWaking, isOnline };
}

export function usePlanets(filters: Filters, page: number) {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPlanets(filters, page);
      setPlanets(res.data);
      setPagination(res.pagination);
    } catch (e) {
      setError('Failed to load planet data. The server may be waking up — try again in a moment.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  return { planets, pagination, loading, error, refetch: load };
}

export function useStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => null);
  }, []);

  return stats;
}
