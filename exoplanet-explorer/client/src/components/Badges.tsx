import React from 'react';
import type { Planet } from '../types';

interface BadgesProps {
  planet: Planet;
}

export const Badges: React.FC<BadgesProps> = ({ planet }) => {
  const badges: { label: string; color: string }[] = [];

  if (planet.in_habitable_zone) {
    badges.push({ label: '🌊 Habitable Zone', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-700' });
  }
  if (planet.is_rocky) {
    badges.push({ label: '🪨 Rocky World', color: 'bg-slate-700/60 text-slate-300 border-slate-600' });
  }
  if (planet.is_gas_giant) {
    badges.push({ label: '🌀 Gas Trap', color: 'bg-red-900/60 text-red-300 border-red-800' });
  }
  if (planet.has_spectral_data) {
    badges.push({ label: '🔬 Spectral Data', color: 'bg-violet-900/60 text-violet-300 border-violet-700' });
  }
  if (planet.biosignature_score >= 70) {
    badges.push({ label: '⭐ High Confidence', color: 'bg-yellow-900/60 text-yellow-300 border-yellow-700' });
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {badges.map((b) => (
        <span
          key={b.label}
          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${b.color}`}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
};
