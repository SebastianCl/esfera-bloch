import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

interface BlochSphereProps {
  theta: number;
  phi: number;
  className?: string;
}

function SphereVisualization({ theta, phi }: { theta: number; phi: number }) {
  const vectorRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);

  // Calculate Cartesian coordinates from spherical
  const position = useMemo(() => {
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    return [x, y, z] as [number, number, number];
  }, [theta, phi]);

  // Gentle rotation animation for sphere
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  // Create sphere wireframe points
  const spherePoints = useMemo(() => {
    const points = [];
    const segments = 32;
    
    // Latitude lines
    for (let i = 0; i <= segments; i++) {
      const lat = (i / segments) * Math.PI;
      const latPoints = [];
      for (let j = 0; j <= segments; j++) {
        const lon = (j / segments) * 2 * Math.PI;
        latPoints.push([
          Math.sin(lat) * Math.cos(lon),
          Math.sin(lat) * Math.sin(lon),
          Math.cos(lat)
        ]);
      }
      points.push(latPoints);
    }
    
    // Longitude lines
    for (let j = 0; j <= segments; j++) {
      const lon = (j / segments) * 2 * Math.PI;
      const lonPoints = [];
      for (let i = 0; i <= segments; i++) {
        const lat = (i / segments) * Math.PI;
        lonPoints.push([
          Math.sin(lat) * Math.cos(lon),
          Math.sin(lat) * Math.sin(lon),
          Math.cos(lat)
        ]);
      }
      points.push(lonPoints);
    }
    
    return points;
  }, []);

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {/* Main sphere (wireframe) */}
      <mesh ref={sphereRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial 
          color="#8B5CF6" 
          wireframe 
          transparent 
          opacity={0.3} 
        />
      </mesh>

      {/* Coordinate axes */}
      <Line
        points={[[-1.5, 0, 0], [1.5, 0, 0]]}
        color="#EF4444"
        lineWidth={2}
      />
      <Line
        points={[[0, -1.5, 0], [0, 1.5, 0]]}
        color="#10B981"
        lineWidth={2}
      />
      <Line
        points={[[0, 0, -1.5], [0, 0, 1.5]]}
        color="#3B82F6"
        lineWidth={2}
      />

      {/* Axis labels */}
      <Text
        position={[1.7, 0, 0]}
        fontSize={0.2}
        color="#EF4444"
        anchorX="center"
        anchorY="middle"
      >
        X
      </Text>
      <Text
        position={[0, 1.7, 0]}
        fontSize={0.2}
        color="#10B981"
        anchorX="center"
        anchorY="middle"
      >
        Y
      </Text>
      <Text
        position={[0, 0, 1.7]}
        fontSize={0.2}
        color="#3B82F6"
        anchorX="center"
        anchorY="middle"
      >
        Z
      </Text>

      {/* State labels */}
      <Text
        position={[0, 0, 1.3]}
        fontSize={0.15}
        color="#A855F7"
        anchorX="center"
        anchorY="middle"
      >
        |0⟩
      </Text>
      <Text
        position={[0, 0, -1.3]}
        fontSize={0.15}
        color="#A855F7"
        anchorX="center"
        anchorY="middle"
      >
        |1⟩
      </Text>

      {/* State vector */}
      <group ref={vectorRef}>
        <Line
          points={[[0, 0, 0], position]}
          color="#F59E0B"
          lineWidth={4}
        />
        
        {/* Vector arrowhead */}
        <mesh position={position}>
          <coneGeometry args={[0.05, 0.15, 8]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
        
        {/* State point */}
        <mesh position={position}>
          <sphereGeometry args={[0.08, 16, 8]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
      </group>

      {/* Equatorial plane */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.98, 1.02, 64]} />
        <meshBasicMaterial 
          color="#A855F7" 
          transparent 
          opacity={0.2} 
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

export function BlochSphere({ theta, phi, className = "" }: BlochSphereProps) {
  return (
    <div className={`sphere-container rounded-xl ${className}`}>
      <Canvas
        camera={{ position: [3, 2, 3], fov: 50 }}
        style={{ height: '100%', width: '100%' }}
      >
        <SphereVisualization theta={theta} phi={phi} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
}