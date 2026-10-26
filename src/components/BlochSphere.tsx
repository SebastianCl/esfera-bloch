import { useRef, useMemo, useEffect, type ComponentRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text, Line, Billboard } from '@react-three/drei';
import { useTheme } from 'next-themes';
import * as THREE from 'three';
import { toBlochVector, toSpherical, rotateAroundAxis, type BlochVector, type GateRotation, type KetKey } from '@/lib/bloch';
import { ket, KET_INFO, type Notation } from '@/lib/notation';
import type { ViewMode } from '@/lib/modes';
import { AXIS_COLORS } from '@/lib/colors';
import { COARSE_POINTER_QUERY, DESKTOP_QUERY, useMediaQuery } from '@/hooks/use-media-query';

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
  notation: Notation;
  mode: ViewMode;
  /** El usuario giró la cámara a mano en una vista fija (polo): la vista pasa a libre. */
  onUserOrbit?: () => void;
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
const CAMERA_SPEED = 4; // suavizado del cambio de cámara entre modos

// Posiciones de cámara (coordenadas Three.js) por modo. OrbitControls usa
// "arriba" = +Y de Three.js = +Z físico, así que:
// - polo: casi sobre +Z físico; el pequeño desplazamiento en -X(Three) = -Y físico
//   fija la orientación en pantalla: X físico a la derecha, Y físico arriba,
//   como el plano complejo (real horizontal, imaginario vertical).
// - circulo: desde -Y físico mirando al plano XZ: X a la derecha, Z arriba.
const CAMERA_POSITIONS: Record<ViewMode, [number, number, number]> = {
  libre: [3, 2, 3],
  polo: [-0.08, 4, 0],
  circulo: [-4, 0, 0],
};

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Colores de la escena que dependen del tema de la página (el canvas es transparente). */
interface Palette {
  state: string;
  wire: string;
  wireOpacity: number;
}

const PALETTES: Record<'dark' | 'light', Palette> = {
  dark: { state: '#C084FC', wire: '#8B5CF6', wireOpacity: 0.3 },
  light: { state: '#6D28D9', wire: '#6D28D9', wireOpacity: 0.35 },
};

interface RotationAnimation {
  rotation: AppliedRotation;
  /** Estado previo a la compuerta, en convención física. */
  start: BlochVector;
  startTime: number | null;
}

/** Etiqueta de texto que siempre mira a la cámara, posicionada en coordenadas físicas. */
function Label({
  at,
  color,
  size = 0.15,
  children,
}: {
  at: BlochVector;
  color: string;
  size?: number;
  children: ReactNode;
}) {
  return (
    <Billboard position={toThree(at)}>
      <Text fontSize={size} color={color} anchorX="center" anchorY="middle" textAlign="center">
        {children}
      </Text>
    </Billboard>
  );
}

// Píxeles que debe moverse el puntero con el botón pulsado para contar como giro
// de cámara. Un tap o un click no llegan; así no sacan de la vista polar.
const ORBIT_SLOP = 8;

/** Mueve la cámara al cambiar de modo y detecta cuándo el usuario toma el control. */
function CameraRig({
  mode,
  onUserOrbit,
  enableZoom,
  enablePan,
}: {
  mode: ViewMode;
  onUserOrbit?: () => void;
  enableZoom: boolean;
  enablePan: boolean;
}) {
  const { camera, gl } = useThree();
  const target = useRef<THREE.Vector3 | null>(null);
  const previousMode = useRef(mode);
  const skipNextAnimation = useRef(false);
  // Refs para que el listener de puntero vea siempre el modo y callback actuales
  const modeRef = useRef(mode);
  const onUserOrbitRef = useRef(onUserOrbit);
  modeRef.current = mode;
  onUserOrbitRef.current = onUserOrbit;

  useEffect(() => {
    if (mode === previousMode.current) return;
    previousMode.current = mode;
    if (skipNextAnimation.current) {
      // El cambio vino de un giro manual: no mover la cámara
      skipNextAnimation.current = false;
      return;
    }
    target.current = new THREE.Vector3(...CAMERA_POSITIONS[mode]);
  }, [mode]);

  useFrame((_, delta) => {
    const goal = target.current;
    if (!goal) return;
    // Interpolar dirección y radio por separado para no atravesar la esfera
    const k = 1 - Math.exp(-delta * CAMERA_SPEED);
    const radius = THREE.MathUtils.lerp(camera.position.length(), goal.length(), k);
    const direction = camera.position.clone().normalize().lerp(goal.clone().normalize(), k);
    if (direction.lengthSq() < 1e-6) direction.copy(UP);
    camera.position.copy(direction.normalize().multiplyScalar(radius));
    if (camera.position.distanceTo(goal) < 0.01) {
      camera.position.copy(goal);
      target.current = null;
    }
  });

  // El giro manual se detecta con el puntero, no con onStart de OrbitControls, que
  // salta ya en pointerdown: un tap, un click para fijar el estado o el inicio de
  // un scroll táctil no deben parar la animación de cámara ni abandonar la vista polar.
  useEffect(() => {
    const el = gl.domElement;
    let start: { x: number; y: number } | null = null;
    let orbiting = false;

    const onDown = (e: PointerEvent) => {
      start = { x: e.clientX, y: e.clientY };
      orbiting = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!start || orbiting) return;
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < ORBIT_SLOP) return;
      orbiting = true;
      target.current = null; // el usuario toma el control
      if (modeRef.current === 'polo' && onUserOrbitRef.current) {
        skipNextAnimation.current = true;
        onUserOrbitRef.current();
      }
    };
    const onUp = () => {
      start = null;
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [gl]);

  return (
    <OrbitControls enablePan={enablePan} enableZoom={enableZoom} enableRotate={true} minDistance={2} maxDistance={8} />
  );
}

function SphereVisualization({
  theta,
  phi,
  onStateChange,
  lastRotation,
  notation,
  mode,
  palette,
}: Omit<BlochSphereProps, 'className' | 'onUserOrbit'> & { palette: Palette }) {
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

  useFrame((state, delta) => {
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

    // event.point viene en coordenadas de mundo y la esfera no tiene transformación.
    // toSpherical normaliza, usa atan2 (acos pierde precisión en los polos) y deja φ en (-π, π].
    const { theta: newTheta, phi: newPhi } = toSpherical(fromThree(event.point));
    onStateChange(newTheta, newPhi);
  };

  const axisPoints = useMemo<[THREE.Vector3, THREE.Vector3] | null>(() => {
    if (!lastRotation) return null;
    const tip = toThree(lastRotation.axis);
    return [tip.clone().multiplyScalar(-1.4), tip.clone().multiplyScalar(1.4)];
  }, [lastRotation]);

  const isCircle = mode === 'circulo';
  const isPole = mode === 'polo';

  // Etiqueta de un autoestado del ecuador. Desde el polo se añade su valor
  // en el plano complejo (+1, −1, +i, −i), como en la lección 31.
  const equatorLabel = (key: KetKey) => (isPole ? `${ket(key, notation)}\n${KET_INFO[key].complex}` : ket(key, notation));

  const STATE_COLOR = palette.state;

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {/* Malla de la esfera, fija respecto a los ejes (atenuada en modo círculo) */}
      <mesh position={[0, 0, 0]} onClick={handleSphereClick}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial
          color={palette.wire}
          wireframe
          transparent
          opacity={isCircle ? palette.wireOpacity / 3 : palette.wireOpacity}
        />
      </mesh>

      {/* Esfera invisible para capturar clicks de forma estable */}
      <mesh position={[0, 0, 0]} onClick={handleSphereClick}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Ejes físicos X (rojo), Y (verde), Z (azul) ya mapeados a Three.js */}
      <Line points={[toThree({ x: -1.5, y: 0, z: 0 }), toThree({ x: 1.5, y: 0, z: 0 })]} color={AXIS_COLORS.x} lineWidth={2} />
      {!isCircle && (
        <Line points={[toThree({ x: 0, y: -1.5, z: 0 }), toThree({ x: 0, y: 1.5, z: 0 })]} color={AXIS_COLORS.y} lineWidth={2} />
      )}
      <Line points={[toThree({ x: 0, y: 0, z: -1.5 }), toThree({ x: 0, y: 0, z: 1.5 })]} color={AXIS_COLORS.z} lineWidth={2} />

      <Label at={{ x: 1.7, y: 0, z: 0 }} color={AXIS_COLORS.x} size={0.2}>
        X
      </Label>
      {!isCircle && (
        <Label at={{ x: 0, y: 1.7, z: 0 }} color={AXIS_COLORS.y} size={0.2}>
          Y
        </Label>
      )}
      {!isPole && (
        <Label at={{ x: 0, y: 0, z: 1.7 }} color={AXIS_COLORS.z} size={0.2}>
          Z
        </Label>
      )}

      {/* Los seis autoestados: Sz en los polos, Sx y Sy en el ecuador */}
      <Label at={{ x: 0, y: 0, z: 1.25 }} color={STATE_COLOR}>
        {ket('zero', notation)}
      </Label>
      {!isPole && (
        <Label at={{ x: 0, y: 0, z: -1.25 }} color={STATE_COLOR}>
          {ket('one', notation)}
        </Label>
      )}
      <Label at={{ x: 1.25, y: 0, z: 0.12 }} color={STATE_COLOR}>
        {equatorLabel('plus')}
      </Label>
      <Label at={{ x: -1.25, y: 0, z: 0.12 }} color={STATE_COLOR}>
        {equatorLabel('minus')}
      </Label>
      {!isCircle && (
        <>
          <Label at={{ x: 0, y: 1.25, z: 0.12 }} color={STATE_COLOR}>
            {equatorLabel('plusI')}
          </Label>
          <Label at={{ x: 0, y: -1.25, z: 0.12 }} color={STATE_COLOR}>
            {equatorLabel('minusI')}
          </Label>
        </>
      )}

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
          <Billboard position={axisPoints[1].clone().multiplyScalar(1.12)}>
            <Text fontSize={0.11} color="#FCD34D" anchorX="center" anchorY="middle">
              {`${lastRotation.name}: ${lastRotation.axisLabel}`}
            </Text>
          </Billboard>
        </group>
      )}

      {/* Ecuador: plano XY físico, horizontal en pantalla */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.98, 1.02, 64]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={isCircle ? 0.08 : 0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Círculo de Bloch: plano XZ físico (x = 0 en Three.js), resaltado en modo círculo */}
      {isCircle && (
        <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.985, 1.015, 96]} />
          <meshBasicMaterial color="#FCD34D" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
    </>
  );
}

export function BlochSphere({
  theta,
  phi,
  className = '',
  onStateChange,
  lastRotation,
  notation,
  mode,
  onUserOrbit,
}: BlochSphereProps) {
  // El tema se lee aquí, fuera del Canvas, y se pasa como prop a la escena
  const { resolvedTheme } = useTheme();
  const palette = resolvedTheme === 'light' ? PALETTES.light : PALETTES.dark;

  // Por debajo de lg la esfera va apilada con el resto: la rueda debe hacer scroll
  // de página (salvo en táctil, donde el zoom es el pellizco) y el paneo con dos
  // dedos solo descentra la esfera.
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const coarsePointer = useMediaQuery(COARSE_POINTER_QUERY);

  return (
    <div className={`sphere-container rounded-xl ${className}`}>
      <Canvas camera={{ position: CAMERA_POSITIONS.libre, fov: 50 }} style={{ height: '100%', width: '100%' }}>
        <SphereVisualization
          theta={theta}
          phi={phi}
          onStateChange={onStateChange}
          lastRotation={lastRotation}
          notation={notation}
          mode={mode}
          palette={palette}
        />
        <CameraRig
          mode={mode}
          onUserOrbit={onUserOrbit}
          enableZoom={isDesktop || coarsePointer}
          enablePan={isDesktop}
        />
      </Canvas>
    </div>
  );
}
