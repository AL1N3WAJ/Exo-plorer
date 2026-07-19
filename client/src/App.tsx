import React, { useState } from 'react';
import { useServerWakeUp, usePlanets, useStats } from './hooks/usePlanets';
import { StatsRow } from './components/StatsRow';
import { FilterBar } from './components/FilterBar';
import { PlanetCard } from './components/PlanetCard';
import { PlanetDrawer } from './components/PlanetDrawer';
import { Pagination } from './components/Pagination';
import { WakeUpScreen } from './components/WakeUpScreen';
import type { Filters, Planet } from './types';

const DEFAULT_FILTERS: Filters = {
  minScore: 0,
  habitableOnly: false,
  searchQuery: '',
};

export default function App() {
  const { isWaking, isOnline } = useServerWakeUp();
  const stats = useStats();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);

  const { planets, pagination, loading, error } = usePlanets(filters, page);

  const handleFilterChange = (f: Filters) => {
    setFilters(f);
    setPage(1);
  };

  const handlePlanetClick = (p: Planet) => setSelectedPlanetId(p.id);

  if (isWaking && !isOnline) {
    return <WakeUpScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-slate-950/90 backdrop-blur-sm">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-100">
            <span className="text-emerald-400">✦</span> Exoplanet Biosignature Explorer
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">NASA Exoplanet Archive · Real-time Habitable Zone Analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-xs font-mono text-slate-500">{isOnline ? 'TELEMETRY ONLINE' : 'CONNECTING…'}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <StatsRow stats={stats} />

        {/* Filters */}
        <FilterBar filters={filters} onChange={handleFilterChange} />

        {/* Planet Grid */}
        {error && (
          <div className="bg-red-900/20 border border-red-800/50 rounded-xl px-5 py-4 text-sm text-red-300 font-mono mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-slate-800/30 border border-slate-700/40 rounded-xl h-36 animate-pulse" />
            ))}
          </div>
        ) : planets.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-mono">
            <p className="text-4xl mb-3">🌌</p>
            <p>No planets match your current filters.</p>
            <p className="text-xs mt-2 text-slate-600">Try lowering the minimum score or broadening your search.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {planets.map((planet) => (
                <PlanetCard key={planet.id} planet={planet} onClick={handlePlanetClick} />
              ))}
            </div>

            {pagination && (
              <Pagination pagination={pagination} onPageChange={setPage} />
            )}
          </>
        )}
      </main>

      {/* Side Drawer */}
      <PlanetDrawer
        planetId={selectedPlanetId}
        onClose={() => setSelectedPlanetId(null)}
      />
    </div>
  );
}
