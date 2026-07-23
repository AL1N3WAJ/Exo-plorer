import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Rotating featured planet
function FeaturedPlanet() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Procedural planet texture
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base ocean color
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#0a2a4a');
    grad.addColorStop(0.4, '#0d3b5e');
    grad.addColorStop(0.7, '#1a5276');
    grad.addColorStop(1, '#0a2a4a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Land masses
    const landColors = ['#1a6b3c', '#2e7d52', '#145a32', '#1e8449'];
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const rx = 20 + Math.random() * 80;
      const ry = 15 + Math.random() * 50;
      ctx.fillStyle = landColors[Math.floor(Math.random() * landColors.length)];
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cloud wisps
    ctx.fillStyle = 'rgba(220,235,255,0.18)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.beginPath();
      ctx.ellipse(x, y, 30 + Math.random() * 60, 8 + Math.random() * 15, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ice caps
    ctx.fillStyle = 'rgba(230,245,255,0.7)';
    ctx.fillRect(0, 0, size, 30);
    ctx.fillRect(0, size - 30, size, 30);

    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y += 0.002;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
      glowRef.current.scale.setScalar(pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.001;
    }
  });

  return (
    <group position={[2.5, 0, 0]}>
      {/* Planet core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshPhongMaterial map={texture} shininess={25} specular={new THREE.Color(0x334455)} />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.52, 32, 32]} />
        <meshBasicMaterial
          color={new THREE.Color(0x10b981)}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshBasicMaterial
          color={new THREE.Color(0x0ea5e9)}
          transparent
          opacity={0.025}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Orbital ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0.3, 0]}>
        <torusGeometry args={[2.2, 0.012, 8, 100]} />
        <meshBasicMaterial color={new THREE.Color(0x10b981)} transparent opacity={0.25} />
      </mesh>

      {/* Small orbiting moon */}
      <OrbitingMoon />
    </group>
  );
}

function OrbitingMoon() {
  const moonRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (moonRef.current) {
      const t = state.clock.elapsedTime * 0.5;
      moonRef.current.position.x = Math.cos(t) * 2.2;
      moonRef.current.position.y = Math.sin(t) * 0.4;
      moonRef.current.position.z = Math.sin(t) * 2.2;
    }
  });

  return (
    <group ref={moonRef}>
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshPhongMaterial color={new THREE.Color(0x8899aa)} shininess={5} />
      </mesh>
    </group>
  );
}

function NebulaParticles() {
  const count = 300;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    return arr;
  }, []);

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const palette = [
      [0.06, 0.73, 0.51], // emerald
      [0.05, 0.65, 0.91], // cyan
      [0.55, 0.36, 0.96], // violet
    ];
    for (let i = 0; i < count; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)];
      arr[i * 3] = c[0];
      arr[i * 3 + 1] = c[1];
      arr[i * 3 + 2] = c[2];
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

interface HeroProps {
  totalPlanets: number;
  habitableCount: number;
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ totalPlanets, habitableCount, onExplore }) => {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: '100vh', minHeight: 560 }}>
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={0.15} />
          <directionalLight position={[-5, 3, 5]} intensity={1.2} color={new THREE.Color(0xfff5e0)} />
          <pointLight position={[5, 5, 5]} intensity={0.3} color={new THREE.Color(0x10b981)} />

          <Suspense fallback={null}>
            <Stars radius={80} depth={50} count={4000} factor={3} saturation={0.3} fade speed={0.5} />
            <NebulaParticles />
            <FeaturedPlanet />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient overlay — left side for text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(2,8,23,0.97) 0%, rgba(2,8,23,0.85) 45%, rgba(2,8,23,0.1) 75%, transparent 100%)',
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: 120, background: 'linear-gradient(to top, #020817, transparent)' }}
      />

      {/* Text content */}
      <div className="absolute inset-0 flex items-center pointer-events-none">
        <div className="px-8 md:px-16 max-w-2xl pointer-events-auto">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
              NASA Exoplanet Archive · Live Data
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-bold text-white leading-none mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              letterSpacing: '-0.02em',
            }}
          >
            Hunt for worlds
            <br />
            <span style={{ color: '#10b981' }}>beyond our sun.</span>
          </h1>

          {/* Sub */}
          <p className="text-slate-400 mb-8 leading-relaxed" style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', maxWidth: 440 }}>
            Filter {totalPlanets.toLocaleString()}+ confirmed exoplanets by habitability,
            mass, and atmospheric chemistry. {habitableCount} sit inside a liquid water zone right now.
          </p>

          {/* Stats pills */}
          <div className="flex gap-3 mb-8 flex-wrap">
            <Pill value={totalPlanets.toLocaleString()} label="Planets Catalogued" color="#10b981" />
            <Pill value={habitableCount.toString()} label="Habitable Zone" color="#22d3ee" />
          </div>

          {/* CTA */}
          <button
            onClick={onExplore}
            className="group flex items-center gap-3 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              fontFamily: "'Space Grotesk', sans-serif",
              boxShadow: '0 0 30px rgba(16,185,129,0.3)',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 40px rgba(16,185,129,0.5)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 30px rgba(16,185,129,0.3)')}
          >
            Explore Exoplanets
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-40">
        <span className="text-xs font-mono text-slate-500">scroll</span>
        <div className="w-px h-6 bg-slate-600" />
      </div>
    </div>
  );
};

const Pill: React.FC<{ value: string; label: string; color: string }> = ({ value, label, color }) => (
  <div
    className="px-4 py-2 rounded-lg border"
    style={{ borderColor: `${color}30`, background: `${color}10` }}
  >
    <span className="font-bold font-mono text-sm" style={{ color }}>{value}</span>
    <span className="text-xs text-slate-500 font-mono ml-2">{label}</span>
  </div>
);
