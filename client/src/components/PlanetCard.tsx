import React from 'react';
import type { Planet } from '../types';
import { ScoreRing } from './ScoreRing';
import { Badges } from './Badges';

interface PlanetCardProps {
  planet: Planet;
  onClick: (p: Planet) => void;
}

export const PlanetCard: React.FC<PlanetCardProps> = ({ planet, onClick }) => {
  return (
    <div
      onClick={() => onClick(planet)}
      className="group bg-slate-800/40 border border-slate-700/50 hover:border-emerald-700/60 rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-800/70 hover:shadow-lg hover:shadow-emerald-900/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-100 font-mono truncate group-hover:text-emerald-300 transition-colors">
            {planet.planet_name}
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{planet.hostname}</p>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <Stat label="Mass" value={planet.planet_mass_earth != null ? `${parseFloat(String(planet.planet_mass_earth)).toFixed(2)} M⊕` : '—'} />
            <Stat label="Radius" value={planet.planet_radius_earth != null ? `${parseFloat(String(planet.planet_radius_earth)).toFixed(2)} R⊕` : '—'} />
            <Stat label="Orbit" value={planet.semi_major_axis_au != null ? `${planet.semi_major_axis_au.toFixed(3)} AU` : '—'} />
          </div>

          <Badges planet={planet} />
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0">
          <ScoreRing score={planet.biosignature_score} />
          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">score</span>
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{label}</p>
    <p className="text-xs text-slate-300 font-mono">{value}</p>
  </div>
);
