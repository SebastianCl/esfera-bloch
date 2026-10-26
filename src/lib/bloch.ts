// Matemática del qubit sobre la esfera de Bloch.
//
// Convención física: Z vertical, |0⟩ en el polo norte (z = +1) y |1⟩ en el
// polo sur. Todo aquí está en esa convención; el mapeo a los ejes de Three.js
// se hace únicamente en BlochSphere.tsx.

import {
  cabs2,
  cconj,
  cexp,
  cmul,
  complex,
  IDENTITY,
  matAdd,
  matScale,
  matVec,
  PAULI,
  type Complex,
  type Matrix2,
} from './complex';

export interface BlochVector {
  x: number;
  y: number;
  z: number;
}

export interface SphericalAngles {
  /** Ángulo polar, en radianes, dentro de [0, π]. */
  theta: number;
  /** Ángulo azimutal, en radianes, dentro de (-π, π]. */
  phi: number;
}

/** Descripción geométrica de una compuerta: rotación de `angle` alrededor de `axis`. */
export interface GateRotation {
  /** Nombre corto de la compuerta (X, Y, Z, H, S, T). */
  name: string;
  /** Eje de rotación, vector unitario en convención física. */
  axis: BlochVector;
  /** Ángulo de rotación en radianes (sentido antihorario mirando desde la punta del eje). */
  angle: number;
  /** Etiqueta legible del eje, para mostrar en pantalla. */
  axisLabel: string;
}

const EPSILON = 1e-12;

/** Elimina residuos de punto flotante (p. ej. 6e-17 o -0). */
export const clean = (value: number): number => (Math.abs(value) < EPSILON ? 0 : value);

export const toBlochVector = (theta: number, phi: number): BlochVector => ({
  x: Math.sin(theta) * Math.cos(phi),
  y: Math.sin(theta) * Math.sin(phi),
  z: Math.cos(theta),
});

/** Vuelve a esféricas con θ ∈ [0, π] y φ ∈ (-π, π]. En los polos φ queda en 0. */
export const toSpherical = (v: BlochVector): SphericalAngles => {
  const x = clean(v.x);
  const y = clean(v.y);
  const z = clean(v.z);
  // atan2(√(x²+y²), z) en vez de acos(z): acos es muy sensible cerca de los
  // polos (acos(1 - 3e-16) ≈ 2.6e-8) y dejaría θ "casi 0" tras una rotación exacta.
  const theta = Math.atan2(Math.hypot(x, y), z);
  let phi = Math.atan2(y, x);
  if (Math.abs(phi + Math.PI) < 1e-9) phi = Math.PI;
  return { theta, phi };
};

export const normalize = (v: BlochVector): BlochVector => {
  const length = Math.hypot(v.x, v.y, v.z);
  if (length < EPSILON) return { x: 0, y: 0, z: 1 };
  return { x: v.x / length, y: v.y / length, z: v.z / length };
};

export const dot = (a: BlochVector, b: BlochVector): number => a.x * b.x + a.y * b.y + a.z * b.z;

export const cross = (a: BlochVector, b: BlochVector): BlochVector => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});

/**
 * Rota `v` un ángulo `angle` alrededor del eje unitario `axis`
 * (fórmula de Rodrigues). Es la operación que representa cualquier
 * compuerta de un qubit sobre la esfera de Bloch.
 */
export const rotateAroundAxis = (v: BlochVector, axis: BlochVector, angle: number): BlochVector => {
  const k = normalize(axis);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const kxv = cross(k, v);
  const kdv = dot(k, v);
  return {
    x: v.x * c + kxv.x * s + k.x * kdv * (1 - c),
    y: v.y * c + kxv.y * s + k.y * kdv * (1 - c),
    z: v.z * c + kxv.z * s + k.z * kdv * (1 - c),
  };
};

const SQRT1_2 = Math.SQRT1_2;

/** Catálogo de compuertas como rotaciones de la esfera. */
export const GATE_ROTATIONS: Record<string, GateRotation> = {
  X: { name: 'X', axis: { x: 1, y: 0, z: 0 }, angle: Math.PI, axisLabel: 'eje X' },
  Y: { name: 'Y', axis: { x: 0, y: 1, z: 0 }, angle: Math.PI, axisLabel: 'eje Y' },
  Z: { name: 'Z', axis: { x: 0, y: 0, z: 1 }, angle: Math.PI, axisLabel: 'eje Z' },
  H: { name: 'H', axis: { x: SQRT1_2, y: 0, z: SQRT1_2 }, angle: Math.PI, axisLabel: 'eje (X+Z)/√2' },
  S: { name: 'S', axis: { x: 0, y: 0, z: 1 }, angle: Math.PI / 2, axisLabel: 'eje Z' },
  T: { name: 'T', axis: { x: 0, y: 0, z: 1 }, angle: Math.PI / 4, axisLabel: 'eje Z' },
};

export const getGateRotation = (gate: string): GateRotation | undefined => GATE_ROTATIONS[gate];

/** Aplica una compuerta a un vector de Bloch. Devuelve el mismo vector si la compuerta no existe. */
export const applyGateToVector = (gate: string, v: BlochVector): BlochVector => {
  const rotation = getGateRotation(gate);
  if (!rotation) return v;
  return rotateAroundAxis(v, rotation.axis, rotation.angle);
};

/** Aplica una compuerta a un estado dado en esféricas. */
export const applyGate = (gate: string, state: SphericalAngles): SphericalAngles =>
  toSpherical(applyGateToVector(gate, toBlochVector(state.theta, state.phi)));

// ---------------------------------------------------------------------------
// Medición en las tres bases
// ---------------------------------------------------------------------------

export interface BasisProbabilities {
  /** Probabilidad del autoestado "+" del eje (|0⟩, |+⟩ o |+i⟩). */
  plus: number;
  /** Probabilidad del autoestado "−" del eje (|1⟩, |−⟩ o |−i⟩). */
  minus: number;
}

/**
 * Probabilidades de medir en las bases Z, X e Y. Para un vector de Bloch
 * (x, y, z) la probabilidad del autoestado "+" de un eje es (1 + componente)/2.
 * En la base Z coincide con |α|² y |β|².
 */
export const measurementProbabilities = (v: BlochVector): { z: BasisProbabilities; x: BasisProbabilities; y: BasisProbabilities } => {
  const clamp = (p: number) => Math.max(0, Math.min(1, p));
  return {
    z: { plus: clamp((1 + v.z) / 2), minus: clamp((1 - v.z) / 2) },
    x: { plus: clamp((1 + v.x) / 2), minus: clamp((1 - v.x) / 2) },
    y: { plus: clamp((1 + v.y) / 2), minus: clamp((1 - v.y) / 2) },
  };
};

// ---------------------------------------------------------------------------
// Círculo de Bloch (lección 30): estados con amplitudes reales, plano XZ
// ---------------------------------------------------------------------------

const TWO_PI = 2 * Math.PI;

/** Un estado está sobre el círculo de Bloch cuando no tiene componente Y (fase real). */
export const isOnCircle = (v: BlochVector): boolean => Math.abs(v.y) < 1e-9;

/** Proyecta un vector al plano XZ y lo renormaliza. El eje Y se proyecta a |0⟩. */
export const projectToCircle = (v: BlochVector): BlochVector => normalize({ x: v.x, y: 0, z: v.z });

/**
 * Ángulo α ∈ [0, 2π) sobre el círculo de Bloch, medido desde |0⟩ hacia |+⟩:
 * x = sin α, z = cos α. Para un estado fuera del plano devuelve el ángulo de su proyección.
 */
export const circleAngleFromState = (state: SphericalAngles): number => {
  const v = toBlochVector(state.theta, state.phi);
  const alpha = Math.atan2(clean(v.x), clean(v.z));
  return ((alpha % TWO_PI) + TWO_PI) % TWO_PI;
};

/** Inverso de circleAngleFromState: α ∈ [0, π] → φ = 0; α ∈ (π, 2π) → φ = π. */
export const stateFromCircleAngle = (alpha: number): SphericalAngles => {
  const a = ((alpha % TWO_PI) + TWO_PI) % TWO_PI;
  return a <= Math.PI ? { theta: a, phi: 0 } : { theta: TWO_PI - a, phi: Math.PI };
};

// ---------------------------------------------------------------------------
// Autoestados fundamentales
// ---------------------------------------------------------------------------

export type KetKey = 'zero' | 'one' | 'plus' | 'minus' | 'plusI' | 'minusI';

/** Posición en esféricas de los seis autoestados de Sz, Sx y Sy. */
export const KET_STATES: Record<KetKey, SphericalAngles> = {
  zero: { theta: 0, phi: 0 },
  one: { theta: Math.PI, phi: 0 },
  plus: { theta: Math.PI / 2, phi: 0 },
  minus: { theta: Math.PI / 2, phi: Math.PI },
  plusI: { theta: Math.PI / 2, phi: Math.PI / 2 },
  minusI: { theta: Math.PI / 2, phi: -Math.PI / 2 },
};

// ---------------------------------------------------------------------------
// Espacio de Hilbert: amplitudes, matriz de densidad y compuertas como matrices
// ---------------------------------------------------------------------------

/** Amplitudes (α, β) de |ψ⟩ = α|0⟩ + β|1⟩. */
export interface Spinor {
  alpha: Complex;
  beta: Complex;
}

/** En los polos (sin θ = 0) el azimut φ no está definido. */
export const isPole = (theta: number): boolean => Math.abs(Math.sin(theta)) < 1e-9;

/**
 * Amplitudes con la convención de fase global de la esfera de Bloch:
 * α = cos(θ/2) real y ≥ 0, β = e^{iφ} sin(θ/2). En los polos se toma φ = 0
 * (si α = 0, β = 1): ahí φ sería una fase global, que no es observable.
 */
export const amplitudes = (state: SphericalAngles): Spinor => {
  const phi = isPole(state.theta) ? 0 : state.phi;
  const half = state.theta / 2;
  const s = Math.sin(half);
  const e = cexp(phi);
  return {
    alpha: complex(clean(Math.cos(half))),
    beta: complex(clean(e.re * s), clean(e.im * s)),
  };
};

/** Vector de Bloch de un espinor: r = (2 Re(α*β), 2 Im(α*β), |α|² − |β|²). El conjugado va en α. */
export const spinorToBlochVector = (s: Spinor): BlochVector => {
  const ab = cmul(cconj(s.alpha), s.beta);
  return {
    x: clean(2 * ab.re),
    y: clean(2 * ab.im),
    z: clean(cabs2(s.alpha) - cabs2(s.beta)),
  };
};

/**
 * Matriz de densidad ρ = ½(I + r·σ) = ½ [[1+z, x−iy], [x+iy, 1−z]].
 * Para un estado puro (|r| = 1) es ρ = |ψ⟩⟨ψ|; con |r| < 1 describiría un estado mixto.
 */
export const densityMatrix = (v: BlochVector): Matrix2 => [
  [complex((1 + v.z) / 2), complex(v.x / 2, -v.y / 2)],
  [complex(v.x / 2, v.y / 2), complex((1 - v.z) / 2)],
];

/** Pureza Tr(ρ²) = (1 + |r|²)/2: 1 en la superficie (puro), ½ en el centro (máximamente mixto). */
export const purity = (v: BlochVector): number => (1 + dot(v, v)) / 2;

/**
 * Solapamiento |⟨ψa|ψb⟩|² = (1 + a·b)/2 = cos²(θ_B/2), con θ_B el ángulo entre
 * los vectores de Bloch. Ortogonal (0) es antípoda (180°); a 90° vale ½.
 */
export const fidelity = (a: BlochVector, b: BlochVector): number => Math.max(0, Math.min(1, (1 + dot(a, b)) / 2));

/** Ángulo entre dos vectores de Bloch, en [0, π]. atan2 en vez de acos: preciso cerca de 0 y π. */
export const angleBetween = (a: BlochVector, b: BlochVector): number => {
  const c = cross(a, b);
  return Math.atan2(Math.hypot(c.x, c.y, c.z), dot(a, b));
};

/**
 * Matriz de la rotación R_n̂(α) = exp(−i α/2 n̂·σ) = cos(α/2) I − i sin(α/2) (n̂·σ).
 * El ángulo de la esfera es α; en el espacio de Hilbert aparece α/2 porque SU(2)
 * recubre dos veces a SO(3): R_n̂(2π) = −I y hacen falta 4π para volver a I.
 */
export const rotationMatrix = (axis: BlochVector, angle: number): Matrix2 => {
  const n = normalize(axis);
  const nSigma = matAdd(
    matAdd(matScale(PAULI.x, complex(n.x)), matScale(PAULI.y, complex(n.y))),
    matScale(PAULI.z, complex(n.z))
  );
  return matAdd(matScale(IDENTITY, complex(Math.cos(angle / 2))), matScale(nSigma, complex(0, -Math.sin(angle / 2))));
};

/** Aplica una matriz 2×2 a un espinor: |ψ'⟩ = U|ψ⟩. */
export const applyMatrix = (U: Matrix2, s: Spinor): Spinor => {
  const [alpha, beta] = matVec(U, [s.alpha, s.beta]);
  return { alpha, beta };
};

export interface GateUnitary {
  /** Matriz de la compuerta en la base {|0⟩, |1⟩}. */
  matrix: Matrix2;
  /** Fase global γ tal que U = e^{iγ} · R_n̂(α), con el eje y el ángulo de GATE_ROTATIONS. */
  globalPhase: number;
}

/**
 * Matrices de las compuertas del catálogo (mismas claves que GATE_ROTATIONS).
 * Cada una es una rotación de la esfera salvo una fase global: X = i·R_x(π),
 * H = i·R_n(π), S = e^{iπ/4}·R_z(π/2), T = e^{iπ/8}·R_z(π/4)…
 */
export const GATE_UNITARIES: Record<string, GateUnitary> = {
  X: { matrix: [[complex(0), complex(1)], [complex(1), complex(0)]], globalPhase: Math.PI / 2 },
  Y: { matrix: [[complex(0), complex(0, -1)], [complex(0, 1), complex(0)]], globalPhase: Math.PI / 2 },
  Z: { matrix: [[complex(1), complex(0)], [complex(0), complex(-1)]], globalPhase: Math.PI / 2 },
  H: { matrix: [[complex(SQRT1_2), complex(SQRT1_2)], [complex(SQRT1_2), complex(-SQRT1_2)]], globalPhase: Math.PI / 2 },
  S: { matrix: [[complex(1), complex(0)], [complex(0), complex(0, 1)]], globalPhase: Math.PI / 4 },
  T: { matrix: [[complex(1), complex(0)], [complex(0), cexp(Math.PI / 4)]], globalPhase: Math.PI / 8 },
};

/**
 * Estado puro aleatorio uniforme sobre la esfera (medida de Haar): cos θ uniforme
 * en [−1, 1] y φ uniforme en (−π, π]. Tomar θ uniforme en [0, π] acumularía estados
 * en los polos. `rng` devuelve valores en [0, 1): la primera llamada fija θ y la
 * segunda φ. Aquí acos es legítimo: es muestreo, no la conversión de un vector calculado.
 */
export const randomState = (rng: () => number = Math.random): SphericalAngles => {
  const theta = Math.acos(1 - 2 * rng());
  const phi = Math.PI * (1 - 2 * rng());
  return { theta, phi };
};
