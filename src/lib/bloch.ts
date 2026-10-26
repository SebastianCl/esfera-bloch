// Matemática del qubit sobre la esfera de Bloch.
//
// Convención física: Z vertical, |0⟩ en el polo norte (z = +1) y |1⟩ en el
// polo sur. Todo aquí está en esa convención; el mapeo a los ejes de Three.js
// se hace únicamente en BlochSphere.tsx.

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
