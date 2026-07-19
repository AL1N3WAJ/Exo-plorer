import React, { useEffect, useState } from 'react';
import type { Planet } from '../types';
import { fetchPlanet } from '../utils/api';
import { ScoreRing } from './ScoreRing';
import { Badges } from './Badges';

interface PlanetDrawerProps {
  planetId: string | null;
  onClose: () => void;
}

// Earth baseline for comparison
const EARTH = {
  mass: 1,
  radius: 1,
  orbital_period: 365.25,
  semi_major_axis: 1.0,
};

const CompareBar: React.FC<{ label: string; earthVal: number; planetVal: number | null; unit: string }> = ({
  label, earthVal, planetVal, unit,
}) => {
  const pv = planetVal ?? 0;
  const max = Math.max(earthVal, pv) * 1.2 || 1;
  const earthPct = (earthVal / max) * 100;
  const planetPct = (pv / max) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
        <span>{label}</span>
        <span className="text-slate-300">{planetVal != null ? `${pv.toFixed(2)} ${unit}` : '—'}</span>
      </div>
      <div className="space-y-1">
        <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-blue-500/60 rounded-full" style={{ width: `${earthPct}%` }} />
        </div>
        <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-emerald-500/70 rounded-full transition-all duration-700" style={{ width: `${planetPct}%` }} />
        </div>
        <div className="flex text-[9px] font-mono text-slate-600 gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-1 bg-blue-500/60 rounded inline-block" />Earth ({earthVal} {unit})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-1 bg-emerald-500/70 rounded inline-block" />Target</span>
        </div>
      </div>
    </div>
  );
};

export const PlanetDrawer: React.FC<PlanetDrawerProps> = ({ planetId, onClose }) => {
  const [planet, setPlanet] = useState<Planet | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!planetId) { setPlanet(null); return; }
    setLoading(true);
    fetchPlanet(planetId)
      .then(setPlanet)
      .finally(() => setLoading(false));
  }, [planetId]);

  const visible = !!planetId;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700/70 z-50 flex flex-col transition-transform duration-300 ${visible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Planet Analysis</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading && (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {!loading && planet && (
            <>
              {/* Name & Score */}
              <div className="flex items-center gap-4 mb-5">
                <ScoreRing score={planet.biosignature_score} size={72} />
                <div>
                  <h2 className="text-lg font-bold font-mono text-slate-100">{planet.planet_name}</h2>
                  <p className="text-sm text-slate-400 font-mono">{planet.hostname}</p>
                  <Badges planet={planet} />
                </div>
              </div>

              {/* Discovery */}
              <Section title="Discovery">
                <Row label="Method" value={planet.discovery_method ?? '—'} />
                <Row label="Distance" value={planet.distance_pc != null ? `${planet.distance_pc.toFixed(1)} pc` : '—'} />
              </Section>

              {/* Stellar */}
              <Section title="Host Star">
                <Row label="T_eff" value={planet.stellar_teff_k != null ? `${planet.stellar_teff_k.toFixed(0)} K` : '—'} />
                <Row label="Mass" value={planet.stellar_mass_solar != null ? `${planet.stellar_mass_solar.toFixed(2)} M☉` : '—'} />
                <Row label="Luminosity" value={planet.stellar_luminosity_log10 != null ? `10^${planet.stellar_luminosity_log10.toFixed(2)} L☉` : '—'} />
                {planet.computed && (
                  <>
                    <Row label="HZ Inner" value={planet.computed.habitable_zone_inner_au ? `${planet.computed.habitable_zone_inner_au} AU` : '—'} />
                    <Row label="HZ Outer" value={planet.computed.habitable_zone_outer_au ? `${planet.computed.habitable_zone_outer_au} AU` : '—'} />
                  </>
                )}
              </Section>

              {/* Earth Comparison */}
              <Section title="vs. Earth">
                <CompareBar label="Mass" earthVal={EARTH.mass} planetVal={planet.planet_mass_earth} unit="M⊕" />
                <CompareBar label="Radius" earthVal={EARTH.radius} planetVal={planet.planet_radius_earth} unit="R⊕" />
                <CompareBar label="Orbital Period" earthVal={EARTH.orbital_period} planetVal={planet.orbital_period_days} unit="days" />
                <CompareBar label="Semi-Major Axis" earthVal={EARTH.semi_major_axis} planetVal={planet.semi_major_axis_au} unit="AU" />
              </Section>

              {/* Atmosphere */}
              <Section title="Atmosphere (Simulation)">
                <Row label="Has Spectral Data" value={planet.has_spectral_data ? 'Yes' : 'No'} />
                <Row label="O₂" value={`${planet.o2_abundance_pct?.toFixed(1) ?? 0}%`} />
                <Row label="CH₄" value={`${planet.ch4_abundance_pct?.toFixed(1) ?? 0}%`} />
                <Row label="H₂O" value={`${planet.h2o_abundance_pct?.toFixed(1) ?? 0}%`} />
                <Row label="CO₂" value={`${planet.co2_abundance_pct?.toFixed(1) ?? 0}%`} />
              </Section>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-700/40 pb-1">{title}</h3>
    {children}
  </div>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between py-1 text-xs font-mono">
    <span className="text-slate-500">{label}</span>
    <span className="text-slate-300">{value}</span>
  </div>
);
