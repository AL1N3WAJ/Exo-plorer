import React from 'react';
import type { Filters } from '../types';

interface FilterBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-5 py-4 mb-5 flex flex-col md:flex-row gap-4 items-center">
      {/* Search */}
      <div className="relative flex-1 w-full">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔭</span>
        <input
          type="text"
          placeholder="Search planet name or host star…"
          value={filters.searchQuery}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          className="w-full bg-slate-900/70 border border-slate-600/60 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500/70 transition-colors"
        />
      </div>

      {/* Habitable Only */}
      <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
        <div
          onClick={() => onChange({ ...filters, habitableOnly: !filters.habitableOnly })}
          className={`w-10 h-5 rounded-full transition-colors relative ${filters.habitableOnly ? 'bg-emerald-500' : 'bg-slate-600'}`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${filters.habitableOnly ? 'translate-x-5' : ''}`}
          />
        </div>
        <span className="text-sm text-slate-300 font-mono">Habitable Zone Only</span>
      </label>

      {/* Score Slider */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-slate-400 font-mono whitespace-nowrap">Min Score</span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={filters.minScore}
          onChange={(e) => onChange({ ...filters, minScore: Number(e.target.value) })}
          className="w-28 accent-emerald-500"
        />
        <span className="text-sm font-bold font-mono text-emerald-400 w-6">{filters.minScore}</span>
      </div>
    </div>
  );
};
