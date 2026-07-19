import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
}

function scoreColor(score: number): string {
  if (score >= 70) return '#10b981'; // emerald
  if (score >= 40) return '#f59e0b'; // amber
  if (score >= 20) return '#f97316'; // orange
  return '#ef4444'; // red
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ score, size = 56 }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#1e293b"
          strokeWidth={5}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <span
        className="absolute text-xs font-bold font-mono"
        style={{ color, fontSize: size < 48 ? 9 : 11 }}
      >
        {score}
      </span>
    </div>
  );
};
