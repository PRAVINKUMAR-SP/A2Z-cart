import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Center, ContactShadows, RoundedBox } from '@react-three/drei';
import { RotateCw, Eye, Sun, Sparkles, Layers, Sliders } from 'lucide-react';

/* -------------------------------------------------------------
 * Realistic High-Fidelity Procedural Hardware Meshes (Non-Cartoon)
 * ------------------------------------------------------------- */
function RealisticProductMesh({ shape = 'headphones', finish = 'dark', wireframe = false }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.004;
    }
  });

  const isSilver = finish === 'silver';
  const isGold = finish === 'gold';
  const chassisColor = isSilver ? '#E2E8F0' : isGold ? '#FBBF24' : '#1E293B';
  const metalColor = isSilver ? '#CBD5E1' : isGold ? '#D97706' : '#0F172A';
  const metalness = isSilver ? 0.95 : isGold ? 0.9 : 0.8;
  const roughness = isSilver ? 0.15 : isGold ? 0.2 : 0.25;

  if (shape === 'headphones') {
    return (
      <group ref={meshRef}>
        {/* Ergonomic Headband Arch */}
        <mesh position={[0, 0.45, 0]}>
          <torusGeometry args={[1.15, 0.075, 20, 60, Math.PI]} />
          <meshStandardMaterial color={chassisColor} metalness={metalness} roughness={roughness} wireframe={wireframe} />
        </mesh>
        {/* Leather Head Cushion */}
        <mesh position={[0, 0.47, 0]}>
          <torusGeometry args={[1.14, 0.088, 16, 50, Math.PI * 0.7]} />
          <meshStandardMaterial color="#090D16" roughness={0.9} metalness={0.05} wireframe={wireframe} />
        </mesh>

        {/* Left Earcup */}
        <group position={[-1.15, 0.35, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.48, 0.48, 0.26, 40]} />
            <meshStandardMaterial color={chassisColor} metalness={metalness} roughness={roughness} wireframe={wireframe} />
          </mesh>
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.49, 0.49, 0.015, 40]} />
            <meshStandardMaterial color="#38BDF8" metalness={0.95} roughness={0.1} wireframe={wireframe} />
          </mesh>
          <mesh position={[0, -0.14, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.12, 40]} />
            <meshStandardMaterial color="#050811" roughness={0.95} metalness={0.02} wireframe={wireframe} />
          </mesh>
        </group>

        {/* Right Earcup */}
        <group position={[1.15, 0.35, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.48, 0.48, 0.26, 40]} />
            <meshStandardMaterial color={chassisColor} metalness={metalness} roughness={roughness} wireframe={wireframe} />
          </mesh>
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.49, 0.49, 0.015, 40]} />
            <meshStandardMaterial color="#38BDF8" metalness={0.95} roughness={0.1} wireframe={wireframe} />
          </mesh>
          <mesh position={[0, -0.14, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.12, 40]} />
            <meshStandardMaterial color="#050811" roughness={0.95} metalness={0.02} wireframe={wireframe} />
          </mesh>
        </group>
      </group>
    );
  }

  if (shape === 'watch') {
    return (
      <group ref={meshRef}>
        {/* Precision Watch Case */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.2, 48]} />
          <meshStandardMaterial color={chassisColor} metalness={metalness} roughness={roughness} wireframe={wireframe} />
        </mesh>
        {/* Polished Chamfered Bezel */}
        <mesh position={[0, 0.1, 0]}>
          <torusGeometry args={[0.88, 0.02, 16, 48]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.98} roughness={0.08} wireframe={wireframe} />
        </mesh>
        {/* Sapphire AMOLED Glass Screen */}
        <mesh position={[0, 0.105, 0]}>
          <cylinderGeometry args={[0.84, 0.84, 0.01, 48]} />
          <meshStandardMaterial color="#020617" roughness={0.05} metalness={0.9} wireframe={wireframe} />
        </mesh>
        {/* Subtle Chrono Dial Graphic Ring */}
        <mesh position={[0, 0.112, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.58, 0.76, 48]} />
          <meshBasicMaterial color="#38BDF8" opacity={0.8} transparent wireframe={wireframe} />
        </mesh>
        {/* Digital Crown */}
        <mesh position={[0.95, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.12, 24]} />
          <meshStandardMaterial color="#64748B" metalness={0.9} roughness={0.2} wireframe={wireframe} />
        </mesh>
        {/* Fluoropolymer Straps */}
        <mesh position={[0, 1.15, -0.04]}>
          <RoundedBox args={[0.65, 1.3, 0.08]} radius={0.02} smoothness={4}>
            <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.1} wireframe={wireframe} />
          </RoundedBox>
        </mesh>
        <mesh position={[0, -1.15, -0.04]}>
          <RoundedBox args={[0.65, 1.3, 0.08]} radius={0.02} smoothness={4}>
            <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.1} wireframe={wireframe} />
          </RoundedBox>
        </mesh>
      </group>
    );
  }

  if (shape === 'laptop') {
    return (
      <group ref={meshRef} position={[0, -0.3, 0]}>
        {/* Precision Unibody Aluminum Base */}
        <RoundedBox args={[2.3, 0.07, 1.55]} radius={0.02} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color={chassisColor} metalness={metalness} roughness={roughness} wireframe={wireframe} />
        </RoundedBox>
        {/* Inset Keyboard Bed */}
        <RoundedBox args={[1.95, 0.015, 0.9]} radius={0.01} smoothness={2} position={[0, 0.04, 0.12]}>
          <meshStandardMaterial color="#090D16" roughness={0.4} metalness={0.3} wireframe={wireframe} />
        </RoundedBox>
        {/* Glass Trackpad */}
        <RoundedBox args={[0.75, 0.005, 0.45]} radius={0.01} smoothness={2} position={[0, 0.04, 0.58]}>
          <meshStandardMaterial color="#334155" roughness={0.15} metalness={0.7} wireframe={wireframe} />
        </RoundedBox>

        {/* Display Lid (Tilted Open at 115 degrees) */}
        <group position={[0, 0.04, -0.75]} rotation={[-Math.PI / 3.2, 0, 0]}>
          <RoundedBox args={[2.3, 1.55, 0.04]} radius={0.02} smoothness={4} position={[0, 0.77, 0]}>
            <meshStandardMaterial color={chassisColor} metalness={metalness} roughness={roughness} wireframe={wireframe} />
          </RoundedBox>
          {/* Edge-to-Edge OLED Panel with Wallpaper Glow */}
          <mesh position={[0, 0.77, 0.022]}>
            <planeGeometry args={[2.2, 1.45]} />
            <meshStandardMaterial
              color="#1E3A8A"
              roughness={0.08}
              metalness={0.8}
              emissive="#1D4ED8"
              emissiveIntensity={0.25}
              wireframe={wireframe}
            />
          </mesh>
        </group>
      </group>
    );
  }

  // Fallback: Elegant High-Tech Drone or Geometric Artifact
  return (
    <group ref={meshRef}>
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color={chassisColor} metalness={metalness} roughness={roughness} wireframe={wireframe} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[1.7, 0.04, 16, 64]} />
        <meshStandardMaterial color="#38BDF8" metalness={0.95} roughness={0.1} wireframe={wireframe} />
      </mesh>
    </group>
  );
}

export default function Product3DViewer({ shape = 'headphones', productName = 'Flagship Product' }) {
  const [wireframe, setWireframe] = useState(false);
  const [finish, setFinish] = useState('dark'); // 'dark' | 'silver' | 'gold'
  const controlsRef = useRef();

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-[400px] md:h-[480px] bg-gradient-to-b from-slate-950 via-[#0B1528] to-[#030712] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between">
      {/* 3D Model Controls Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs text-white shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-bold">Photorealistic 360° Studio Orbit</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-full border border-white/10">
          {/* Finish Presets */}
          <button
            onClick={() => setFinish(finish === 'dark' ? 'silver' : finish === 'silver' ? 'gold' : 'dark')}
            className="px-2.5 py-1 text-[11px] font-bold rounded-full transition-all text-slate-300 hover:text-white bg-slate-800/80 flex items-center gap-1"
            title="Cycle Hardware Materials"
          >
            <Sliders className="w-3 h-3 text-cyan-400" />
            <span className="capitalize">{finish} Edition</span>
          </button>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all flex items-center gap-1 ${
              wireframe ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
            title="Inspect CAD Topology"
          >
            <Eye className="w-3 h-3" />
            {wireframe ? 'Wireframe' : 'Solid'}
          </button>

          <button
            onClick={handleResetView}
            className="p-1 text-slate-300 hover:text-white rounded-full transition-all"
            title="Reset Angle"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <Suspense
        fallback={
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold tracking-wide text-slate-300">Rendering Realistic 3D CAD Geometry...</p>
          </div>
        }
      >
        <Canvas camera={{ position: [0, 0, 4.3], fov: 42 }} className="w-full h-full cursor-grab active:cursor-grabbing">
          {/* Professional Studio Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[6, 8, 4]} intensity={2.2} color="#FFFFFF" />
          <directionalLight position={[-6, 4, 3]} intensity={1.2} color="#93C5FD" />
          <directionalLight position={[0, -4, -4]} intensity={0.8} color="#1E293B" />
          <pointLight position={[0, 3, 2]} intensity={1.2} color="#38BDF8" />

          <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.4}>
            <Center>
              <RealisticProductMesh shape={shape} finish={finish} wireframe={wireframe} />
            </Center>
          </Float>

          {/* Soft Ground Contact Shadow */}
          <ContactShadows position={[0, -1.5, 0]} opacity={0.7} scale={8} blur={2.2} far={3.5} color="#000000" />
          <OrbitControls ref={controlsRef} enablePan={false} minDistance={2.5} maxDistance={6.5} dampingFactor={0.05} />
        </Canvas>
      </Suspense>

      {/* Bottom Hint Indicator */}
      <div className="absolute bottom-3 left-4 text-[11px] text-slate-400 flex items-center gap-1.5 pointer-events-none">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Click & drag to inspect 360° · Scroll wheel to zoom</span>
      </div>
    </div>
  );
}
