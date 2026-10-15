import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function House() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Roof */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.2, 1, 4]} />
        <meshStandardMaterial color="#F97316" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Main walls */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1.2, 1]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.5} />
      </mesh>

      {/* Door */}
      <mesh position={[0, -0.2, 0.51]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.6, 0.1]} />
        <meshStandardMaterial color="#1E3A8A" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Windows */}
      {[
        [-0.25, 0.3, 0.51],
        [0.25, 0.3, 0.51],
        [-0.25, 0.3, -0.51],
        [0.25, 0.3, -0.51],
      ].map((pos, i) => (
        <mesh key={i} position={pos as any} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.2, 0.05]} />
          <meshStandardMaterial color="#0EA5E9" metalness={0.6} roughness={0.2} />
        </mesh>
      ))}

      {/* Base/Foundation */}
      <mesh position={[0, -0.7, 0]} receiveShadow>
        <boxGeometry args={[1.3, 0.3, 1.3]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
    </group>
  );
}

function ApartmentBuilding() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main building */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 2, 0.8]} />
        <meshStandardMaterial color="#f3f4f6" metalness={0.1} roughness={0.6} />
      </mesh>

      {/* Windows grid */}
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => {
          const x = -0.3 + col * 0.2;
          const y = -0.8 + row * 0.45;
          return (
            <mesh key={`window-${row}-${col}`} position={[x, y, 0.41]} castShadow receiveShadow>
              <boxGeometry args={[0.12, 0.12, 0.05]} />
              <meshStandardMaterial color="#0EA5E9" metalness={0.7} roughness={0.2} />
            </mesh>
          );
        })
      )}

      {/* Roof */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.2, 0.85]} />
        <meshStandardMaterial color="#1E3A8A" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Scene() {
  const lightRef = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.position.set(10, 20, 10);
      lightRef.current.castShadow = true;
      lightRef.current.shadow.mapSize.width = 2048;
      lightRef.current.shadow.mapSize.height = 2048;
    }
  }, []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 3]} />
      <ambientLight intensity={0.6} />
      <directionalLight ref={lightRef} intensity={1.2} />
      <pointLight position={[-10, 10, 5]} intensity={0.5} color="#0EA5E9" />

      <group>
        <House />
        <ApartmentBuilding />
      </group>

      {/* Environment */}
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      <OrbitControls autoRotate autoRotateSpeed={3} enableZoom={false} enablePan={false} />
    </>
  );
}

export function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
