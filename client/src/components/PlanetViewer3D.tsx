import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { Planet } from '../types';

// Deterministic random from planet name
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h ^= h << 13; h ^= h >> 17; h ^= h << 5;
    return ((h >>> 0) / 4294967296);
  };
}

function planetTypeFromMass(mass: number | null): 'rocky' | 'ocean' | 'desert' | 'gas' | 'ice' {
  if (mass === null) return 'rocky';
  if (mass > 10) return 'gas';
  if (mass > 4) return 'ocean';
  if (mass > 1.5) return 'desert';
  if (mass < 0.5) return 'ice';
  return 'rocky';
}

function generatePlanetTexture(seed: string, type: string): THREE.CanvasTexture {
  const rng = seededRandom(seed);
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const palettes: Record<string, string[][]> = {
    rocky: [['#3d2b1f', '#5c3d2e', '#7a5c4a', '#2d1f14'], ['#1a6b3c', '#0d3b5e', '#2e7d52']],
    ocean:  [['#0a1a3a', '#0d2b5e', '#1a4a8a', '#0a3060'], ['#1a6b3c', '#2e9e6b', '#ffffff']],
    desert: [['#7a4a1a', '#9e6a2a', '#c4893a', '#5a3010'], ['#9e7a3a', '#c4a04a', '#4a2808']],
    gas:    [['#4a2a6a', '#6a3a8a', '#8a4aaa', '#2a1a4a'], ['#c4603a', '#e4804a', '#6a2a1a']],
    ice:    [['#a0c0e0', '#b0d0f0', '#c0e0ff', '#8090a0'], ['#e0f0ff', '#d0e8ff', '#ffffff']],
  };

  const palette = palettes[type] || palettes.rocky;
  const baseColors = palette[0];
  const accentColors = palette[1];

  // Base gradient
  const grad = ctx.createRadialGradient(size * 0.4, size * 0.35, 0, size / 2, size / 2, size * 0.7);
  grad.addColorStop(0, baseColors[1]);
  grad.addColorStop(0.5, baseColors[0]);
  grad.addColorStop(1, baseColors[3] || baseColors[0]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Surface features
  if (type === 'rocky' || type === 'ocean') {
    for (let i = 0; i < 15; i++) {
      const x = rng() * size; const y = rng() * size;
      const rx = 15 + rng() * 90; const ry = 10 + rng() * 55;
      ctx.fillStyle = accentColors[Math.floor(rng() * accentColors.length)];
      ctx.globalAlpha = 0.4 + rng() * 0.4;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (type === 'gas') {
    // Bands
    for (let i = 0; i < 18; i++) {
      const y = rng() * size;
      const h = 8 + rng() * 40;
      ctx.fillStyle = accentColors[Math.floor(rng() * accentColors.length)];
      ctx.globalAlpha = 0.15 + rng() * 0.25;
      ctx.fillRect(0, y, size, h);
    }
    // Great spot
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = accentColors[0];
    ctx.beginPath();
    ctx.ellipse(size * 0.6, size * 0.55, 45, 28, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  if (type === 'desert') {
    for (let i = 0; i < 30; i++) {
      const x = rng() * size; const y = rng() * size;
      ctx.fillStyle = baseColors[Math.floor(rng() * baseColors.length)];
      ctx.globalAlpha = 0.3 + rng() * 0.4;
      ctx.beginPath();
      ctx.arc(x, y, 5 + rng() * 25, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;

  // Cloud layer
  if (type !== 'gas') {
    ctx.fillStyle = 'rgba(230,242,255,0.15)';
    for (let i = 0; i < 18; i++) {
      const x = rng() * size; const y = rng() * size;
      ctx.beginPath();
      ctx.ellipse(x, y, 25 + rng() * 70, 6 + rng() * 18, rng() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ice caps
  if (type === 'rocky' || type === 'ocean' || type === 'ice') {
    ctx.fillStyle = 'rgba(220,240,255,0.75)';
    ctx.fillRect(0, 0, size, 22);
    ctx.fillRect(0, size - 22, size, 22);
  }

  return new THREE.CanvasTexture(canvas);
}

function atmosphereColor(planet: Planet): THREE.Color {
  if (planet.in_habitable_zone && !planet.is_gas_giant) return new THREE.Color(0x10b981);
  if (planet.is_gas_giant) return new THREE.Color(0xf59e0b);
  return new THREE.Color(0x6366f1);
}

function PlanetMesh({ planet }: { planet: Planet }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  const type = planetTypeFromMass(planet.planet_mass_earth);
  const texture = useMemo(() => generatePlanetTexture(planet.planet_name, type), [planet.planet_name, type]);

  const radius = useMemo(() => {
    const r = planet.planet_radius_earth ? parseFloat(String(planet.planet_radius_earth)) : 1;
    return Math.max(0.5, Math.min(2.0, r * 0.7));
  }, [planet.planet_radius_earth]);

  const glowColor = atmosphereColor(planet);

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.003;
    if (cloudRef.current) cloudRef.current.rotation.y += 0.0045;
  });

  return (
    <group>
      {/* Planet */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhongMaterial map={texture} shininess={type === 'ocean' ? 60 : 15} />
      </mesh>

      {/* Cloud layer */}
      {type !== 'gas' && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[radius * 1.02, 32, 32]} />
          <meshBasicMaterial color={0xffffff} transparent opacity={0.07} />
        </mesh>
      )}

      {/* Atmosphere inner */}
      <mesh>
        <sphereGeometry args={[radius * 1.07, 32, 32]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>

      {/* Atmosphere outer glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.22, 32, 32]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>

      {/* Gas giant rings */}
      {type === 'gas' && (
        <mesh rotation={[Math.PI / 6, 0, 0.3]}>
          <torusGeometry args={[radius * 1.7, radius * 0.22, 3, 80]} />
          <meshBasicMaterial color={0xc4803a} transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function LoadingPlanet() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.01; });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.8, 16, 16]} />
      <meshBasicMaterial color={0x1e293b} wireframe />
    </mesh>
  );
}

interface PlanetViewer3DProps {
  planet: Planet;
  height?: number;
}

export const PlanetViewer3D: React.FC<PlanetViewer3DProps> = ({ planet, height = 260 }) => {
  return (
    <div
      className="w-full rounded-xl overflow-hidden relative"
      style={{ height, background: 'radial-gradient(ellipse at center, #0d1f3c 0%, #020817 70%)' }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.1} />
        <directionalLight position={[-4, 2, 4]} intensity={1.4} color={0xfff5e0} />
        <pointLight position={[3, 3, 3]} intensity={0.2} color={0x10b981} />

        <Suspense fallback={<LoadingPlanet />}>
          <Stars radius={60} depth={30} count={1500} factor={2} saturation={0.2} fade speed={0.3} />
          <PlanetMesh planet={planet} />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={7}
            autoRotate={false}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>

      {/* Labels */}
      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end pointer-events-none">
        <span className="text-[10px] font-mono text-slate-500">drag to rotate · scroll to zoom</span>
        <span className="text-[10px] font-mono text-slate-600 uppercase">
          {planetTypeFromMass(planet.planet_mass_earth).replace('_', ' ')} world
        </span>
      </div>
    </div>
  );
};
