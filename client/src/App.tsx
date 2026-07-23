import React, { useState, useRef } from 'react';
import { useServerWakeUp, usePlanets, useStats } from './hooks/usePlanets';
import { StatsRow } from './components/StatsRow';
import { FilterBar } from './components/FilterBar';
import { PlanetCard } from './components/PlanetCard';
import { PlanetDrawer } from './components/PlanetDrawer';
import { Pagination } from './components/Pagination';
import { WakeUpScreen } from './components/WakeUpScreen';
import { Hero } from './components/Hero';
import type { Filters, Planet } from './types';

const DEFAULT_FILTERS: Filters = {
  minScore: 0,
  habitableOnly: false,
  searchQuery: '',
};

export default function App() {
  const { isWaking, isOnline } = useServerWakeUp();
  const stats = useStats();
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);

  const { planets, pagination, loading, error } = usePlanets(filters, page);

  const handleFilterChange = (f: Filters) => {
    setFilters(f);
    setPage(1);
  };

  const handlePlanetClick = (p: Planet) => setSelectedPlanetId(p.id);

  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isWaking && !isOnline) {
    return <WakeUpScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Sticky nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(2,8,23,0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(30,41,59,0.5)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-lg">✦</span>
          <span className="text-sm font-semibold text-slate-200" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Exoplanet Explorer
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-[10px] font-mono text-slate-500 hidden sm:block">
              {isOnline ? 'TELEMETRY ONLINE' : 'CONNECTING…'}
            </span>
          </div>
          <button
            onClick={scrollToDashboard}
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-emerald-600/50 hover:text-emerald-300 transition-all"
          >
            Dashboard →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <Hero
        totalPlanets={stats ? parseInt(stats.total_planets) : 6324}
        habitableCount={stats ? parseInt(stats.habitable_zone_count) : 312}
        onExplore={scrollToDashboard}
      />

      {/* Dashboard */}
      <div ref={dashboardRef} className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-px h-5 bg-emerald-500/50" />
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Planetary Database</h2>
        </div>

        {/* Stats */}
        <StatsRow stats={stats} />

        {/* Filters */}
        <FilterBar filters={filters} onChange={handleFilterChange} />

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-800/40 rounded-xl px-5 py-4 text-sm text-red-300 font-mono mb-4">
            {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-slate-800/30 border border-slate-700/30 rounded-xl h-40 animate-pulse" />
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
            {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 px-6 py-6 text-center">
        <p className="text-xs font-mono text-slate-600">
          Data sourced from the{' '}
          <a href="https://exoplanetarchive.ipac.caltech.edu" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-emerald-400 transition-colors">
            NASA Exoplanet Archive
          </a>
          {' '}· Biosignature scores are research models, not confirmed detections
        </p>
      </footer>

      {/* Detail Drawer */}
      <PlanetDrawer
        planetId={selectedPlanetId}
        onClose={() => setSelectedPlanetId(null)}
      />
    </div>
  );
}
