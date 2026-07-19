export interface Planet {
  id: string;
  planet_name: string;
  hostname: string;
  discovery_method: string | null;
  orbital_period_days: number | null;
  semi_major_axis_au: number | null;
  planet_mass_earth: number | null;
  planet_radius_earth: number | null;
  stellar_luminosity_log10: number | null;
  stellar_mass_solar: number | null;
  stellar_teff_k: number | null;
  distance_pc: number | null;
  has_spectral_data: boolean;
  o2_abundance_pct: number;
  ch4_abundance_pct: number;
  h2o_abundance_pct: number;
  co2_abundance_pct: number;
  biosignature_score: number;
  last_updated: string;
  in_habitable_zone: boolean;
  is_rocky: boolean;
  is_gas_giant: boolean;
  computed?: {
    stellar_luminosity_solar: number | null;
    habitable_zone_inner_au: string | null;
    habitable_zone_outer_au: string | null;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PlanetsResponse {
  data: Planet[];
  pagination: PaginationInfo;
}

export interface StatsResponse {
  total_planets: string;
  habitable_zone_count: string;
  high_confidence_count: string;
  avg_score: string;
}

export interface Filters {
  minScore: number;
  habitableOnly: boolean;
  searchQuery: string;
}
