import React, { useEffect, useState } from 'react';
import type { Planet } from '../types';
import { fetchPlanet } from '../utils/api';
import { ScoreRing } from './ScoreRing';
import { Badges } from './Badges';
import { PlanetViewer3D } from './PlanetViewer3D';

interface PlanetDrawerProps {
  planetId: string | null;
  onClose: () => void;
}

const EARTH = {
  mass: 1,
  radius: 1,
  orbital_period: 365.25,
  semi_major_axis: 1.0,
};

const n = (val: number | null | undefined): number => parseFloat(String(val ?? 0)) || 0;
const fmt = (val: number | null | undefined, decimals = 2): string =>
  val != null ? n(val).toFixed(decimals) : '—';

const CompareBar: React.FC<{
  label: string;
  earthVal: number;
  planetVal: number | null;
  unit: string;
}> = ({ label, earthVal, planetVal, unit }) => {
  const pv = n(planetVal);
  const max = Math.max(earthVal, pv) * 1.2 || 1;
  const earthPct = (earthVal / max) * 100;
  const planetPct = (pv / max) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
        <span>{label}</span>
        <span className="text-slate-300">{planetVal != null ? `${pv.toFixed(2)} ${unit}` : '—'}</span>
      </div>
      <div className="space-y-1.5">
        <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-indigo-500/60 rounded-full"
            style={{ width: `${earthPct}%` }}
          />
        </div>
        <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-emerald-500/70 rounded-full transition-all duration-700"
            style={{ width: `${planetPct}%` }}
          />
        </div>
        <div className="flex text-[9px] font-mono text-slate-600 gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-1 bg-indigo-500/60 rounded inline-block" />
            Earth ({earthVal} {unit})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-1 bg-emerald-500/70 rounded inline-block" />
            Target
          </span>
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
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'linear-gradient(180deg, #0a1628 0%, #0f172a 100%)',
          borderLeft: '1px solid rgba(51,65,85,0.6)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(30,41,59,0.8)' }}
        >
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Planet Analysis
          </span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors text-lg leading-none w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-700/50"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-5 space-y-3">
              <div className="h-64 bg-slate-800/40 rounded-xl animate-pulse" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-7 bg-slate-800/40 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {!loading && planet && (
            <>
              {/* 3D Viewer */}
              <div className="px-4 pt-4">
                <PlanetViewer3D planet={planet} height={240} />
              </div>

              <div className="px-5 py-4">
                {/* Name & Score */}
                <div className="flex items-start gap-4 mb-5">
                  <ScoreRing score={planet.biosignature_score} size={64} />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold font-mono text-slate-100 truncate">
                      {planet.planet_name}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">{planet.hostname}</p>
                    <div className="mt-2">
                      <Badges planet={planet} />
                    </div>
                  </div>
                </div>

                {/* Discovery */}
                <Section title="Discovery">
                  <Row label="Method" value={planet.discovery_method ?? '—'} />
                  <Row
                    label="Distance"
                    value={planet.distance_pc != null ? `${fmt(planet.distance_pc, 1)} pc` : '—'}
                  />
                </Section>

                {/* Host Star */}
                <Section title="Host Star">
                  <Row
                    label="T_eff"
                    value={planet.stellar_teff_k != null ? `${fmt(planet.stellar_teff_k, 0)} K` : '—'}
                  />
                  <Row
                    label="Mass"
                    value={planet.stellar_mass_solar != null ? `${fmt(planet.stellar_mass_solar)} M☉` : '—'}
                  />
                  <Row
                    label="Luminosity"
                    value={
                      planet.stellar_luminosity_log10 != null
                        ? `10^${fmt(planet.stellar_luminosity_log10)} L☉`
                        : '—'
                    }
                  />
                  {planet.computed && (
                    <>
                      <Row
                        label="HZ Inner"
                        value={
                          planet.computed.habitable_zone_inner_au
                            ? `${planet.computed.habitable_zone_inner_au} AU`
                            : '—'
                        }
                      />
                      <Row
                        label="HZ Outer"
                        value={
                          planet.computed.habitable_zone_outer_au
                            ? `${planet.computed.habitable_zone_outer_au} AU`
                            : '—'
                        }
                      />
                    </>
                  )}
                </Section>

                {/* Earth Comparison */}
                <Section title="vs. Earth">
                  <CompareBar label="Mass" earthVal={EARTH.mass} planetVal={planet.planet_mass_earth} unit="M⊕" />
                  <CompareBar label="Radius" earthVal={EARTH.radius} planetVal={planet.planet_radius_earth} unit="R⊕" />
                  <CompareBar
                    label="Orbital Period"
                    earthVal={EARTH.orbital_period}
                    planetVal={planet.orbital_period_days}
                    unit="days"
                  />
                  <CompareBar
                    label="Semi-Major Axis"
                    earthVal={EARTH.semi_major_axis}
                    planetVal={planet.semi_major_axis_au}
                    unit="AU"
                  />
                </Section>

                {/* Atmosphere */}
                <Section title="Atmosphere (Simulation)">
                  <Row label="Spectral Data" value={planet.has_spectral_data ? 'Yes' : 'No'} />
                  <Row label="O₂" value={`${fmt(planet.o2_abundance_pct, 1)}%`} />
                  <Row label="CH₄" value={`${fmt(planet.ch4_abundance_pct, 1)}%`} />
                  <Row label="H₂O" value={`${fmt(planet.h2o_abundance_pct, 1)}%`} />
                  <Row label="CO₂" value={`${fmt(planet.co2_abundance_pct, 1)}%`} />
                </Section>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <h3
      className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2 pb-1"
      style={{ borderBottom: '1px solid rgba(30,41,59,0.8)' }}
    >
      {title}
    </h3>
    {children}
  </div>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between py-1 text-xs font-mono">
    <span className="text-slate-500">{label}</span>
    <span className="text-slate-300">{value}</span>
  </div>
);
