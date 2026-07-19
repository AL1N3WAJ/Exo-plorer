import type { PlanetsResponse, StatsResponse, Planet, Filters } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function fetchPlanets(
  filters: Filters,
  page: number,
  limit = 20
): Promise<PlanetsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    minScore: String(filters.minScore),
    habitableOnly: String(filters.habitableOnly),
    searchQuery: filters.searchQuery,
  });
  return apiFetch<PlanetsResponse>(`/api/exoplanets?${params}`);
}

export async function fetchStats(): Promise<StatsResponse> {
  return apiFetch<StatsResponse>('/api/exoplanets/stats');
}

export async function fetchPlanet(id: string): Promise<Planet> {
  return apiFetch<Planet>(`/api/exoplanets/${id}`);
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
