import React, { useEffect, useState } from 'react';

const DOTS = ['·', '··', '···'];
const MESSAGES = [
  'Initializing deep-space telemetry arrays…',
  'Calibrating biosignature detection matrix…',
  'Synchronizing with NASA Exoplanet Archive…',
  'Waking up exoplanet classification engines…',
];

export const WakeUpScreen: React.FC = () => {
  const [dotIdx, setDotIdx] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const dotTimer = setInterval(() => setDotIdx((i) => (i + 1) % 3), 500);
    const msgTimer = setInterval(() => setMsgIdx((i) => (i + 1) % MESSAGES.length), 4000);
    const elTimer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { clearInterval(dotTimer); clearInterval(msgTimer); clearInterval(elTimer); };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      {/* Starfield dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.1,
              animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center px-6 max-w-md">
        {/* Orbiting animation */}
        <div className="w-20 h-20 mx-auto mb-8 relative">
          <div className="w-20 h-20 rounded-full border-2 border-slate-700 absolute" />
          <div
            className="w-3 h-3 rounded-full bg-emerald-400 absolute"
            style={{
              top: '50%',
              left: '50%',
              marginTop: -6,
              marginLeft: -6,
              animation: 'orbit 2s linear infinite',
              transformOrigin: '-34px 0px',
            }}
          />
          <div className="w-6 h-6 rounded-full bg-slate-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <h1 className="text-slate-100 font-mono text-lg font-semibold mb-3">
          Waking up deep-space telemetry servers{DOTS[dotIdx]}
        </h1>
        <p className="text-slate-400 font-mono text-sm mb-6">
          Please allow up to 1 minute for data initialization.
        </p>
        <p className="text-emerald-500/70 font-mono text-xs">{MESSAGES[msgIdx]}</p>
        <p className="text-slate-600 font-mono text-xs mt-4">{elapsed}s elapsed</p>
      </div>

      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(34px); }
          to   { transform: rotate(360deg) translateX(34px); }
        }
      `}</style>
    </div>
  );
};
