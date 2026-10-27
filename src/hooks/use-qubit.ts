import { useRef, useState } from 'react';
import type { AppliedRotation } from '@/components/BlochSphere';
import {
  applyGate as applyGateToState,
  getGateRotation,
  isOnCircle,
  KET_STATES,
  projectToCircle,
  randomState,
  stateFromCircleAngle,
  toBlochVector,
  toSpherical,
  type KetKey,
  type SphericalAngles,
} from '@/lib/bloch';
import { ket, type Notation } from '@/lib/notation';
import type { ViewMode } from '@/lib/modes';

/**
 * Estado del qubit y todas las acciones sobre él: compuertas (con animación e
 * historial para deshacer), presets, sliders, click en la esfera y modos de
 * vista con la regla del círculo de Bloch. Lo usan el laboratorio (Index) y el
 * curso (Teoria); cada página tiene su propio qubit. Las páginas son solo
 * layout: esta es la única implementación de cada acción.
 */

/** Una compuerta aplicada y el estado que había antes, para poder deshacerla. */
export interface GateHistoryEntry {
  gate: string;
  from: SphericalAngles;
}

/** Aviso que emite el hook en cada acción; cada página decide cómo mostrarlo (toast, línea bajo la esfera o nada). */
export interface QubitNotice {
  kind: 'gate' | 'undo' | 'clear' | 'preset' | 'random' | 'reset' | 'click' | 'circle-left' | 'circle-projected';
  title: string;
  description?: string;
  duration?: number;
}

export interface UseQubitOptions {
  notation: Notation;
  /** Estado inicial: el laboratorio arranca cerca de |+⟩, el curso en |0⟩. */
  initial?: SphericalAngles;
  notify?: (notice: QubitNotice) => void;
}

const degrees = (radians: number) => ((radians * 180) / Math.PI).toFixed(1);
const describeState = (s: SphericalAngles) => `θ=${degrees(s.theta)}°, φ=${degrees(s.phi)}°`;

const DEFAULT_INITIAL: SphericalAngles = { theta: Math.PI / 3, phi: 0 };

export function useQubit({ notation, initial = DEFAULT_INITIAL, notify }: UseQubitOptions) {
  const [theta, setTheta] = useState(initial.theta);
  const [phi, setPhi] = useState(initial.phi);
  // Última compuerta aplicada: la esfera la usa para animar el arco y mostrar el eje.
  // Se pone en null cuando el estado cambia por otro medio (slider, click, preset).
  const [lastRotation, setLastRotation] = useState<AppliedRotation | null>(null);
  const rotationCounter = useRef(0);
  const [mode, setMode] = useState<ViewMode>('libre');
  // Secuencia de compuertas desde el último estado fijado a mano
  const [history, setHistory] = useState<GateHistoryEntry[]>([]);

  const setState = (next: SphericalAngles) => {
    setTheta(next.theta);
    setPhi(next.phi);
  };

  const animateRotation = (rotation: Omit<AppliedRotation, 'id'>) => {
    rotationCounter.current += 1;
    setLastRotation({ ...rotation, id: rotationCounter.current });
  };

  /** El estado cambió a mano: sin animación de compuerta y el circuito empieza de nuevo. */
  const manualChange = (next: SphericalAngles) => {
    setState(next);
    setLastRotation(null);
    setHistory([]);
  };

  /**
   * En modo círculo (lección 30) solo caben amplitudes reales. Si una acción
   * saca el estado del plano XZ, se explica la limitación y se pasa a la
   * esfera completa (lección 31). Devuelve true si se salió del círculo.
   */
  const leaveCircleIfNeeded = (next: SphericalAngles, cause: string): boolean => {
    if (mode !== 'circulo') return false;
    if (isOnCircle(toBlochVector(next.theta, next.phi))) return false;
    setMode('libre');
    notify?.({
      kind: 'circle-left',
      title: 'El estado salió del círculo de Bloch',
      description: `${cause} introduce una fase imaginaria y el círculo no puede representarla. Hace falta el eje Y: la esfera completa.`,
      duration: 7000,
    });
    return true;
  };

  const applyGate = (gate: string) => {
    const rotation = getGateRotation(gate);
    if (!rotation) return;

    const from = { theta, phi };
    const next = applyGateToState(gate, from);
    setState(next);
    animateRotation(rotation);
    setHistory((h) => [...h, { gate, from }]);

    const left = leaveCircleIfNeeded(next, `La compuerta ${gate}`);
    if (!left) {
      notify?.({
        kind: 'gate',
        title: `Compuerta ${gate} aplicada`,
        description: `Rotación de ${degrees(rotation.angle)}° alrededor del ${rotation.axisLabel}. Nuevo estado: ${describeState(next)}`,
      });
    }
  };

  const undoGate = () => {
    const entry = history[history.length - 1];
    if (!entry) return;
    const rotation = getGateRotation(entry.gate);
    setState(entry.from);
    setHistory((h) => h.slice(0, -1));
    if (rotation) {
      // Deshacer es la rotación inversa: mismo eje, ángulo opuesto
      animateRotation({ ...rotation, angle: -rotation.angle, name: `${entry.gate}⁻¹` });
    }
    notify?.({ kind: 'undo', title: `Compuerta ${entry.gate} deshecha`, description: `Estado: ${describeState(entry.from)}` });
  };

  const clearHistory = () => {
    setHistory([]);
    notify?.({
      kind: 'clear',
      title: 'Circuito vaciado',
      description: 'El estado actual se conserva como nuevo punto de partida.',
    });
  };

  const applyPreset = (preset: KetKey | 'random') => {
    if (preset === 'random') {
      // Uniforme sobre la esfera (Haar: cos θ uniforme, no θ); en el círculo basta α uniforme
      const next = mode === 'circulo' ? stateFromCircleAngle(Math.random() * 2 * Math.PI) : randomState();
      manualChange(next);
      notify?.({ kind: 'random', title: 'Estado aleatorio generado', description: describeState(next) });
      return;
    }

    const next = KET_STATES[preset];
    manualChange(next);
    const left = leaveCircleIfNeeded(next, `El estado ${ket(preset, notation)}`);
    if (!left) notify?.({ kind: 'preset', title: `Estado ${ket(preset, notation)} aplicado` });
  };

  const handleReset = () => {
    manualChange(KET_STATES.zero);
    notify?.({ kind: 'reset', title: `Estado reiniciado a ${ket('zero', notation)}` });
  };

  const handleRotationChange = (angle: 'theta' | 'phi' | 'alpha', value: number) => {
    if (angle === 'alpha') {
      manualChange(stateFromCircleAngle(value));
    } else if (angle === 'theta') {
      manualChange({ theta: value, phi });
    } else {
      manualChange({ theta, phi: value });
    }
  };

  const handleSphereClick = (newTheta: number, newPhi: number) => {
    let next: SphericalAngles = { theta: newTheta, phi: newPhi };
    if (mode === 'circulo') {
      // En el círculo solo valen puntos del plano XZ: proyectar el click
      next = toSpherical(projectToCircle(toBlochVector(newTheta, newPhi)));
    }
    manualChange(next);
    notify?.({ kind: 'click', title: 'Estado actualizado por click en la esfera', description: describeState(next) });
  };

  const handleModeChange = (next: ViewMode) => {
    if (next === mode) return;
    if (next === 'circulo') {
      const v = toBlochVector(theta, phi);
      if (!isOnCircle(v)) {
        manualChange(toSpherical(projectToCircle(v)));
        notify?.({
          kind: 'circle-projected',
          title: 'Estado proyectado al círculo de Bloch',
          description: 'Se eliminó la componente Y (la fase imaginaria) para que el estado quepa en el plano XZ.',
        });
      }
    }
    setMode(next);
  };

  return {
    theta,
    phi,
    state: { theta, phi } as SphericalAngles,
    lastRotation,
    mode,
    history,
    applyGate,
    undoGate,
    clearHistory,
    applyPreset,
    reset: handleReset,
    setAngle: handleRotationChange,
    setFromSphereClick: handleSphereClick,
    /** Cambio de modo con la regla del círculo (proyección y aviso): el que usan el selector de modos y las acciones. */
    changeMode: handleModeChange,
    /** El usuario giró la cámara a mano en una vista fija: vuelta a libre sin proyectar ni avisar. */
    exitFixedView: () => setMode('libre'),
  };
}

export type QubitController = ReturnType<typeof useQubit>;
