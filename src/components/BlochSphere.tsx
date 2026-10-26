import { useRef, useMemo, useEffect, type ComponentRef } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { toBlochVector, rotateAroundAxis, type BlochVector, type GateRotation } from '@/lib/bloch';

/** Rotación aplicada por una compuerta, con un id único para distinguir aplicaciones sucesivas. */
export interface AppliedRotation extends GateRotation {
  id: number;
}

interface BlochSphereProps {
  theta: number;
  phi: number;
  className?: string;
  onStateChange?: (theta: number, phi: number) => void;
  /** Última compuerta aplicada; null si el estado cambió por slider, click o preset. */
  lastRotation?: AppliedRotation | null;
}

// Mapeo física → Three.js. En física Z es vertical; en Three.js lo es Y.
// Se usa (x, y, z) → (y, z, x) y no (x, z, y) porque un simple intercambio
// de dos ejes es una reflexión y dejaría una terna izquierda: X × Y daría -Z
// en pantalla y el sentido de giro de las compuertas quedaría invertido.
const toThree = (v: BlochVector): THREE.Vector3 => new THREE.Vector3(v.y, v.z, v.x);
const fromThree = (p: THREE.Vector3): BlochVector => ({ x: p.z, y: p.x, z: p.y });

const UP = new THREE.Vector3(0, 1, 0);
const ROTATION_DURATION = 0.9; // segundos que dura el arco de una compuerta
const AXIS_HOLD = 1.5; // segundos que el eje sigue visible tras el arco
const AXIS_FADE = 0.5; // segundos de desvanecimiento del eje
const TRAIL_POINTS = 64;
const FOLLOW_SPEED = 12; // suavizado al seguir sliders/clicks (mayor = más rápido)

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface RotationAnimation {
  rotation: AppliedRotation;
  /** Estado previo a la compuerta, en convención física. */
  start: BlochVector;
  startTime: number | null;
}

function SphereVisualization({ theta, phi, onStateChange, lastRotation }: Omit<BlochSphereProps, 'className'>) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const arrowRef = useRef<THREE.Group>(null);
  const axisGroupRef = useRef<THREE.Group>(null);
  const axisLineRef = useRef<ComponentRef<typeof Line>>(null);
  const trailRef = useRef<ComponentRef<typeof Line>>(null);

  // Vector que se dibuja. Difiere del estado real mientras hay animación.
  const displayed = useRef(toBlochVector(theta, phi));
  const animation = useRef<RotationAnimation | null>(null);

  // Buffer reutilizado para el arco que recorre la punta del vector durante una compuerta
  const trailPositions = useMemo(() => new Float32Array(TRAIL_POINTS * 3), []);
  const trailInitialPoints = useMemo<[number, number, number][]>(
    () => Array.from({ length: TRAIL_POINTS }, () => [0, 0, 0]),
    []
  );

  const hideTrail = () => {
    if (trailRef.current) trailRef.current.visible = false;
  };

  // Al aplicar una compuerta: arrancar el arco desde el estado previo.
  // Si el estado cambió por otro medio, cancelar animación y ocultar el eje.
  useEffect(() => {
    if (lastRotation) {
      const target = toBlochVector(theta, phi);
      animation.current = {
        rotation: lastRotation,
        start: rotateAroundAxis(target, lastRotation.axis, -lastRotation.angle),
        startTime: null,
      };
      if (axisGroupRef.current) axisGroupRef.current.visible = true;
      if (axisLineRef.current) axisLineRef.current.material.opacity = 1;
    } else {
      animation.current = null;
      hideTrail();
      if (axisGroupRef.current) axisGroupRef.current.visible = false;
    }
    // theta/phi se leen aquí solo porque cambian en el mismo render que lastRotation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastRotation?.id]);

  // Giro suave y decorativo de la malla
  useFrame((state, delta) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }

    const anim = animation.current;
    if (anim) {
      if (anim.startTime === null) anim.startTime = state.clock.elapsedTime;
      const elapsed = state.clock.elapsedTime - anim.startTime;
      const progress = Math.min(1, elapsed / ROTATION_DURATION);
      const angle = anim.rotation.angle * easeInOutCubic(progress);
      displayed.current = rotateAroundAxis(anim.start, anim.rotation.axis, angle);

      // Dibujar el arco recorrido hasta ahora, ligeramente fuera de la esfera
      if (trailRef.current) {
        for (let i = 0; i < TRAIL_POINTS; i++) {
          const a = (angle * i) / (TRAIL_POINTS - 1);
          const p = toThree(rotateAroundAxis(anim.start, anim.rotation.axis, a)).multiplyScalar(1.01);
          trailPositions[i * 3] = p.x;
          trailPositions[i * 3 + 1] = p.y;
          trailPositions[i * 3 + 2] = p.z;
        }
        trailRef.current.geometry.setPositions(trailPositions);
        trailRef.current.visible = true;
      }

      // Desvanecer el eje y el arco pasado el tiempo de espera
      const fadeStart = ROTATION_DURATION + AXIS_HOLD;
      const opacity = elapsed < fadeStart ? 1 : Math.max(0, 1 - (elapsed - fadeStart) / AXIS_FADE);
      if (axisLineRef.current) axisLineRef.current.material.opacity = opacity;
      if (trailRef.current) trailRef.current.material.opacity = 0.9 * opacity;
      if (elapsed >= fadeStart + AXIS_FADE) {
        animation.current = null;
        hideTrail();
        if (axisGroupRef.current) axisGroupRef.current.visible = false;
      }
    } else {
      // Seguir el estado real con suavizado (sliders, clicks, presets)
      const target = toThree(toBlochVector(theta, phi));
      const current = toThree(displayed.current);
      if (current.distanceTo(target) > 1e-4) {
        const full = new THREE.Quaternion().setFromUnitVectors(current.normalize(), target);
        const k = 1 - Math.exp(-delta * FOLLOW_SPEED);
        const step = new THREE.Quaternion().slerp(full, k);
        current.applyQuaternion(step).normalize();
        displayed.current = fromThree(current);
      } else {
        displayed.current = toBlochVector(theta, phi);
      }
    }

    if (arrowRef.current) {
      const direction = toThree(displayed.current).normalize();
      arrowRef.current.quaternion.setFromUnitVectors(UP, direction);
    }
  });

  // Click sobre la esfera: punto en coordenadas de mundo (Three.js) → física → esféricas
  const handleSphereClick = (event: ThreeEvent<MouseEvent>) => {
    if (!onStateChange) return;
    event.stopPropagation();

    const point = event.point.clone().normalize();
    const v = fromThree(point);
    const newTheta = Math.acos(Math.max(-1, Math.min(1, v.z)));
    const newPhi = Math.atan2(v.y, v.x);
    onStateChange(newTheta, newPhi);
  };

  const axisPoints = useMemo<[THREE.Vector3, THREE.Vector3] | null>(() => {
    if (!lastRotation) return null;
    const tip = toThree(lastRotation.axis);
    return [tip.clone().multiplyScalar(-1.4), tip.clone().multiplyScalar(1.4)];
  }, [lastRotation]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {/* Malla de la esfera */}
      <mesh ref={sphereRef} position={[0, 0, 0]} onClick={handleSphereClick}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial color="#8B5CF6" wireframe transparent opacity={0.3} />
      </mesh>

      {/* Esfera invisible para capturar clicks de forma estable */}
      <mesh position={[0, 0, 0]} onClick={handleSphereClick}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Ejes físicos X (rojo), Y (verde), Z (azul) ya mapeados a Three.js */}
      <Line points={[toThree({ x: -1.5, y: 0, z: 0 }), toThree({ x: 1.5, y: 0, z: 0 })]} color="#EF4444" lineWidth={2} />
      <Line points={[toThree({ x: 0, y: -1.5, z: 0 }), toThree({ x: 0, y: 1.5, z: 0 })]} color="#10B981" lineWidth={2} />
      <Line points={[toThree({ x: 0, y: 0, z: -1.5 }), toThree({ x: 0, y: 0, z: 1.5 })]} color="#3B82F6" lineWidth={2} />

      <Text position={toThree({ x: 1.7, y: 0, z: 0 })} fontSize={0.2} color="#EF4444" anchorX="center" anchorY="middle">
        X
      </Text>
      <Text position={toThree({ x: 0, y: 1.7, z: 0 })} fontSize={0.2} color="#10B981" anchorX="center" anchorY="middle">
        Y
      </Text>
      <Text position={toThree({ x: 0, y: 0, z: 1.7 })} fontSize={0.2} color="#3B82F6" anchorX="center" anchorY="middle">
        Z
      </Text>

      {/* |0⟩ en el polo norte (z = +1), |1⟩ en el polo sur */}
      <Text position={toThree({ x: 0, y: 0, z: 1.3 })} fontSize={0.15} color="#A855F7" anchorX="center" anchorY="middle">
        |0⟩
      </Text>
      <Text position={toThree({ x: 0, y: 0, z: -1.3 })} fontSize={0.15} color="#A855F7" anchorX="center" anchorY="middle">
        |1⟩
      </Text>

      {/* Vector de estado: flecha a lo largo de +Y local, orientada por cuaternión en cada frame */}
      <group ref={arrowRef}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.9, 12]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
        <mesh position={[0, 0.925, 0]}>
          <coneGeometry args={[0.05, 0.15, 12]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.08, 16, 8]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
      </group>

      {/* Arco recorrido durante una compuerta. Sin test de profundidad para que
          no lo tape el anillo del ecuador ni la malla; se rellena en useFrame. */}
      <Line
        ref={trailRef}
        points={trailInitialPoints}
        color="#FCD34D"
        lineWidth={3}
        transparent
        opacity={0.9}
        depthTest={false}
        visible={false}
      />

      {/* Eje de rotación de la última compuerta */}
      {lastRotation && axisPoints && (
        <group ref={axisGroupRef}>
          <Line
            ref={axisLineRef}
            points={axisPoints}
            color="#FCD34D"
            lineWidth={2.5}
            dashed
            dashSize={0.08}
            gapSize={0.05}
            transparent
            opacity={1}
            depthTest={false}
          />
          <Text
            position={axisPoints[1].clone().multiplyScalar(1.12)}
            fontSize={0.11}
            color="#FCD34D"
            anchorX="center"
            anchorY="middle"
          >
            {`${lastRotation.name}: ${lastRotation.axisLabel}`}
          </Text>
        </group>
      )}

      {/* Ecuador: plano XY físico, horizontal en pantalla */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.98, 1.02, 64]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

export function BlochSphere({ theta, phi, className = '', onStateChange, lastRotation }: BlochSphereProps) {
  return (
    <div className={`sphere-container rounded-xl ${className}`}>
      <Canvas camera={{ position: [3, 2, 3], fov: 50 }} style={{ height: '100%', width: '100%' }}>
        <SphereVisualization theta={theta} phi={phi} onStateChange={onStateChange} lastRotation={lastRotation} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={2} maxDistance={8} />
      </Canvas>
    </div>
  );
}
