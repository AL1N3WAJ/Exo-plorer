import React from 'react';
import type { StatsResponse } from '../types';

interface StatsRowProps {
  stats: StatsResponse | null;
}

const Card: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent = 'text-emerald-400' }) => (
  <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl px-5 py-4 flex flex-col gap-1">
    <span className={`text-2xl font-bold font-mono ${accent}`}>{value}</span>
    <span className="text-xs text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);

export const StatsRow: React.FC<StatsRowProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-5 py-4 h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <Card label="Planets Scanned" value={Number(stats.total_planets).toLocaleString()} />
      <Card label="Habitable Zone" value={Number(stats.habitable_zone_count).toLocaleString()} accent="text-cyan-400" />
      <Card label="Score ≥ 70" value={Number(stats.high_confidence_count).toLocaleString()} accent="text-yellow-400" />
      <Card label="Avg. Score" value={stats.avg_score ?? '—'} accent="text-violet-400" />
    </div>
  );
};
