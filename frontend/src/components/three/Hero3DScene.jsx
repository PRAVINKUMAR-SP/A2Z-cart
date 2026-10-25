import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows, RoundedBox, Center } from '@react-three/drei';
import { RotateCw } from 'lucide-react';

/* -------------------------------------------------------------
 * Clean, Human-Designed Photorealistic Flagship Headphones
 * ------------------------------------------------------------- */
function FlagshipHeadphones({ finish = 'obsidian' }) {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Smooth, natural studio showcase rotation
      groupRef.current.rotation.y = t * 0.25;
      groupRef.current.position.y = Math.sin(t * 0.7) * 0.04;
    }
  });

  const isTitanium = finish === 'titanium';
  const isGold = finish === 'gold';

  const chassisColor = isTitanium ? '#E2E8F0' : isGold ? '#F59E0B' : '#0F172A';
  const metallicAccent = isTitanium ? '#94A3B8' : isGold ? '#D97706' : '#2563EB';
  const armColor = isTitanium ? '#CBD5E1' : isGold ? '#B45309' : '#1E293B';
  const metalness = isTitanium ? 0.96 : isGold ? 0.92 : 0.88;
  const roughness = isTitanium ? 0.14 : isGold ? 0.16 : 0.22;
  const ledGlow = isGold ? '#FDE047' : '#38BDF8';

  return (
    <group ref={groupRef} scale={1.2} position={[0, 0, 0]}>
      {/* 1. Main Curved Aluminum Headband */}
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[0.85, 0.05, 24, 80, Math.PI]} />
        <meshStandardMaterial
          color={chassisColor}
          metalness={metalness}
          roughness={roughness}
        />
      </mesh>

      {/* 2. Top Ergonomic Leather Cushion */}
      <mesh position={[0, 0.41, 0]}>
        <torusGeometry args={[0.84, 0.068, 20, 60, Math.PI * 0.72]} />
        <meshStandardMaterial
          color="#030712"
          roughness={0.92}
          metalness={0.05}
        />
      </mesh>

      {/* 3. Left Extension Arm */}
      <group position={[-0.85, 0.15, 0]}>
        <RoundedBox args={[0.06, 0.52, 0.09]} radius={0.015} smoothness={4}>
          <meshStandardMaterial color={armColor} metalness={0.95} roughness={0.12} />
        </RoundedBox>
        <mesh position={[0.032, 0, 0]}>
          <boxGeometry args={[0.008, 0.32, 0.04]} />
          <meshBasicMaterial color={ledGlow} />
        </mesh>
      </group>

      {/* 4. Right Extension Arm */}
      <group position={[0.85, 0.15, 0]}>
        <RoundedBox args={[0.06, 0.52, 0.09]} radius={0.015} smoothness={4}>
          <meshStandardMaterial color={armColor} metalness={0.95} roughness={0.12} />
        </RoundedBox>
        <mesh position={[-0.032, 0, 0]}>
          <boxGeometry args={[0.008, 0.32, 0.04]} />
          <meshBasicMaterial color={ledGlow} />
        </mesh>
      </group>

      {/* 5. Left Earcup Assembly (Facing inward toward the head) */}
      <group position={[-0.85, -0.22, 0]}>
        <mesh position={[0, 0.14, 0]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.22, 0.025, 16, 32, Math.PI]} />
          <meshStandardMaterial color={armColor} metalness={0.95} roughness={0.1} />
        </mesh>

        <group rotation={[0, 0, Math.PI / 2]}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.18, 48]} />
            <meshStandardMaterial
              color={chassisColor}
              metalness={metalness}
              roughness={roughness}
            />
          </mesh>
          <mesh position={[0, 0.175, 0]}>
            <cylinderGeometry args={[0.385, 0.385, 0.012, 48]} />
            <meshStandardMaterial color={metallicAccent} metalness={0.96} roughness={0.08} />
          </mesh>
          <mesh position={[0, 0.182, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.28, 0.31, 40]} />
            <meshBasicMaterial color={ledGlow} />
          </mesh>
          <mesh position={[0, 0.183, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.006, 32]} />
            <meshStandardMaterial color="#0B0F19" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 48]} />
            <meshStandardMaterial color="#030712" roughness={0.95} metalness={0.02} />
          </mesh>
          <mesh position={[0, -0.105, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.015, 32]} />
            <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.5} />
          </mesh>
        </group>
      </group>

      {/* 6. Right Earcup Assembly (Facing inward toward the head) */}
      <group position={[0.85, -0.22, 0]}>
        <mesh position={[0, 0.14, 0]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.22, 0.025, 16, 32, Math.PI]} />
          <meshStandardMaterial color={armColor} metalness={0.95} roughness={0.1} />
        </mesh>

        <group rotation={[0, 0, -Math.PI / 2]}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.18, 48]} />
            <meshStandardMaterial
              color={chassisColor}
              metalness={metalness}
              roughness={roughness}
            />
          </mesh>
          <mesh position={[0, 0.175, 0]}>
            <cylinderGeometry args={[0.385, 0.385, 0.012, 48]} />
            <meshStandardMaterial color={metallicAccent} metalness={0.96} roughness={0.08} />
          </mesh>
          <mesh position={[0, 0.182, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.28, 0.31, 40]} />
            <meshBasicMaterial color={ledGlow} />
          </mesh>
          <mesh position={[0, 0.183, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.006, 32]} />
            <meshStandardMaterial color="#0B0F19" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 48]} />
            <meshStandardMaterial color="#030712" roughness={0.95} metalness={0.02} />
          </mesh>
          <mesh position={[0, -0.105, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.015, 32]} />
            <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function Hero3DScene() {
  const [finish, setFinish] = useState('obsidian'); // 'obsidian' | 'titanium' | 'gold'
  const controlsRef = useRef();

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="w-full h-full min-h-[440px] md:min-h-[520px] relative flex flex-col justify-end items-center select-none">
      
      {/* Seamless 3D Canvas */}
      <Suspense
        fallback={
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 42 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
        >
          {/* Natural Studio Lights */}
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 8, 5]} intensity={2.2} color="#FFFFFF" />
          <directionalLight position={[-5, 4, 3]} intensity={1.4} color="#93C5FD" />
          <directionalLight position={[0, -4, -3]} intensity={0.6} color="#1E293B" />
          <pointLight position={[0, 2, 3]} intensity={1.2} color="#38BDF8" />

          {/* Centered Realistic Headphones */}
          <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
            <Center>
              <FlagshipHeadphones finish={finish} />
            </Center>
          </Float>

          {/* Soft Ground Contact Shadow */}
          <ContactShadows
            position={[0, -1.35, 0]}
            opacity={0.55}
            scale={6.5}
            blur={2.4}
            far={3.5}
            color="#000000"
          />

          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={false}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 2.5}
            dampingFactor={0.05}
          />
        </Canvas>
      </Suspense>

      {/* Human-Crafted Minimalist Material Swatches */}
      <div className="absolute bottom-3 flex flex-col items-center gap-2 z-20 pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
          {[
            { id: 'obsidian', label: 'Obsidian', color: 'bg-slate-900 border border-slate-700' },
            { id: 'titanium', label: 'Titanium', color: 'bg-slate-200' },
            { id: 'gold', label: 'Gold', color: 'bg-amber-400' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFinish(f.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                finish === f.id
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${f.color}`}></span>
              <span>{f.label}</span>
            </button>
          ))}
          <button
            onClick={handleReset}
            className="p-1 text-slate-400 hover:text-white rounded-full transition-all ml-1"
            title="Reset Angle"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-[11px] text-slate-400/80 font-medium tracking-wide">
          Drag to inspect 360°
        </span>
      </div>
    </div>
  );
}
