import { describe, expect, it } from 'vitest';
import {
  amplitudes,
  angleBetween,
  applyGate,
  applyGateToVector,
  applyMatrix,
  densityMatrix,
  fidelity,
  GATE_ROTATIONS,
  GATE_UNITARIES,
  isPole,
  KET_STATES,
  circleAngleFromState,
  isOnCircle,
  measurementProbabilities,
  normalize,
  projectToCircle,
  purity,
  randomState,
  rotateAroundAxis,
  rotationMatrix,
  spinorToBlochVector,
  stateFromCircleAngle,
  toBlochVector,
  toSpherical,
  type BlochVector,
  type SphericalAngles,
} from './bloch';
import { cconj, cexp, cmul, IDENTITY, matAdjoint, matMul, matScale, PAULI, trace, type Complex, type Matrix2 } from './complex';

const P = Math.PI;

// Estados conocidos en esféricas (θ, φ)
const KET_0: SphericalAngles = { theta: 0, phi: 0 };
const KET_1: SphericalAngles = { theta: P, phi: 0 };
const KET_PLUS: SphericalAngles = { theta: P / 2, phi: 0 };
const KET_MINUS: SphericalAngles = { theta: P / 2, phi: P };
const KET_PLUS_I: SphericalAngles = { theta: P / 2, phi: P / 2 };
const KET_MINUS_I: SphericalAngles = { theta: P / 2, phi: -P / 2 };

const expectAngles = (got: SphericalAngles, want: SphericalAngles) => {
  expect(got.theta).toBeCloseTo(want.theta, 9);
  expect(got.phi).toBeCloseTo(want.phi, 9);
};

const expectVector = (got: BlochVector, want: BlochVector) => {
  expect(got.x).toBeCloseTo(want.x, 9);
  expect(got.y).toBeCloseTo(want.y, 9);
  expect(got.z).toBeCloseTo(want.z, 9);
};

describe('conversión esféricas ↔ vector de Bloch', () => {
  it('coloca |0⟩ en el polo norte y |1⟩ en el polo sur', () => {
    expectVector(toBlochVector(0, 0), { x: 0, y: 0, z: 1 });
    expectVector(toBlochVector(P, 0), { x: 0, y: 0, z: -1 });
  });

  it('coloca los autoestados de X e Y sobre el ecuador', () => {
    expectVector(toBlochVector(P / 2, 0), { x: 1, y: 0, z: 0 });
    expectVector(toBlochVector(P / 2, P), { x: -1, y: 0, z: 0 });
    expectVector(toBlochVector(P / 2, P / 2), { x: 0, y: 1, z: 0 });
    expectVector(toBlochVector(P / 2, -P / 2), { x: 0, y: -1, z: 0 });
  });

  it('es invertible para estados genéricos', () => {
    const state = { theta: 1.1, phi: 2.3 };
    expectAngles(toSpherical(toBlochVector(state.theta, state.phi)), state);
  });

  it('normaliza φ a (-π, π] y lo deja en 0 en los polos', () => {
    expect(toSpherical({ x: -1, y: -1e-17, z: 0 }).phi).toBeCloseTo(P, 9);
    expect(toSpherical({ x: 0, y: 0, z: 1 }).phi).toBe(0);
    expect(toSpherical({ x: 0, y: 0, z: -1 }).phi).toBe(0);
  });

  it('limpia residuos de punto flotante y nunca devuelve -0', () => {
    const { theta, phi } = toSpherical({ x: 1, y: -1e-17, z: 6e-17 });
    expect(Object.is(phi, -0)).toBe(false);
    expect(phi).toBe(0);
    expect(theta).toBeCloseTo(P / 2, 9);
  });
});

describe('rotateAroundAxis (Rodrigues)', () => {
  it('rota π/2 alrededor de Z llevando +X a +Y', () => {
    expectVector(rotateAroundAxis({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, P / 2), { x: 0, y: 1, z: 0 });
  });

  it('deja invariante cualquier vector sobre el eje', () => {
    const axis = { x: 0.6, y: 0, z: 0.8 };
    expectVector(rotateAroundAxis(axis, axis, 1.7), axis);
  });

  it('acepta ejes no normalizados', () => {
    expectVector(rotateAroundAxis({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 5 }, P), { x: -1, y: 0, z: 0 });
  });
});

describe('compuertas de Pauli', () => {
  it('X: |0⟩↔|1⟩, deja |+⟩ fijo y lleva |+i⟩ a |-i⟩', () => {
    expectAngles(applyGate('X', KET_0), KET_1);
    expectAngles(applyGate('X', KET_1), KET_0);
    expectAngles(applyGate('X', KET_PLUS), KET_PLUS);
    expectAngles(applyGate('X', KET_PLUS_I), KET_MINUS_I);
  });

  it('Y: |0⟩↔|1⟩, lleva |+⟩ a |-⟩ y deja |+i⟩ fijo', () => {
    expectAngles(applyGate('Y', KET_0), KET_1);
    expectAngles(applyGate('Y', KET_PLUS), KET_MINUS);
    expectAngles(applyGate('Y', KET_PLUS_I), KET_PLUS_I);
  });

  it('Z: deja |0⟩ fijo y lleva |+⟩ a |-⟩', () => {
    expectAngles(applyGate('Z', KET_0), KET_0);
    expectAngles(applyGate('Z', KET_PLUS), KET_MINUS);
    expectAngles(applyGate('Z', KET_PLUS_I), KET_MINUS_I);
  });

  it('aplican (x,y,z) → (x,-y,-z), (-x,y,-z), (-x,-y,z) sobre un vector genérico', () => {
    const v = toBlochVector(1.1, 2.3);
    expectVector(applyGateToVector('X', v), { x: v.x, y: -v.y, z: -v.z });
    expectVector(applyGateToVector('Y', v), { x: -v.x, y: v.y, z: -v.z });
    expectVector(applyGateToVector('Z', v), { x: -v.x, y: -v.y, z: v.z });
  });
});

describe('compuerta Hadamard', () => {
  it('intercambia la base Z con la base X', () => {
    expectAngles(applyGate('H', KET_0), KET_PLUS);
    expectAngles(applyGate('H', KET_1), KET_MINUS);
    expectAngles(applyGate('H', KET_PLUS), KET_0);
    expectAngles(applyGate('H', KET_MINUS), KET_1);
  });

  it('invierte la base Y', () => {
    expectAngles(applyGate('H', KET_PLUS_I), KET_MINUS_I);
  });

  it('aplica (x,y,z) → (z,-y,x) sobre un vector genérico', () => {
    const v = toBlochVector(P / 3, P / 6);
    expectVector(applyGateToVector('H', v), { x: v.z, y: -v.y, z: v.x });
  });
});

describe('compuertas de fase', () => {
  it('S suma π/2 a φ y T suma π/4', () => {
    expectAngles(applyGate('S', KET_PLUS), KET_PLUS_I);
    expectAngles(applyGate('S', KET_MINUS_I), KET_PLUS);
    expectAngles(applyGate('T', KET_PLUS), { theta: P / 2, phi: P / 4 });
  });

  it('T aplicada dos veces equivale a S', () => {
    const v = toBlochVector(1.1, 2.3);
    expectVector(applyGateToVector('T', applyGateToVector('T', v)), applyGateToVector('S', v));
  });

  it('no cambian θ', () => {
    const state = { theta: 0.7, phi: -2.1 };
    expect(applyGate('S', state).theta).toBeCloseTo(state.theta, 9);
    expect(applyGate('T', state).theta).toBeCloseTo(state.theta, 9);
  });
});

describe('propiedades generales', () => {
  it('X, Y, Z y H son involuciones', () => {
    const v = toBlochVector(1.1, 2.3);
    for (const gate of ['X', 'Y', 'Z', 'H']) {
      expectVector(applyGateToVector(gate, applyGateToVector(gate, v)), v);
    }
  });

  it('todas las compuertas conservan la norma', () => {
    const v = toBlochVector(0.4, -1.9);
    for (const gate of Object.keys(GATE_ROTATIONS)) {
      const r = applyGateToVector(gate, v);
      expect(Math.hypot(r.x, r.y, r.z)).toBeCloseTo(1, 9);
    }
  });

  it('todos los ejes del catálogo son unitarios', () => {
    for (const { axis } of Object.values(GATE_ROTATIONS)) {
      expect(Math.hypot(axis.x, axis.y, axis.z)).toBeCloseTo(1, 9);
    }
  });

  it('una compuerta desconocida deja el vector intacto', () => {
    const v = toBlochVector(1.1, 2.3);
    expect(applyGateToVector('Q', v)).toEqual(v);
  });
});

describe('medición en las bases Z, X e Y', () => {
  it('|0⟩ es certeza en Z y 50/50 en X e Y', () => {
    const p = measurementProbabilities(toBlochVector(0, 0));
    expect(p.z.plus).toBeCloseTo(1, 9);
    expect(p.z.minus).toBeCloseTo(0, 9);
    expect(p.x.plus).toBeCloseTo(0.5, 9);
    expect(p.y.minus).toBeCloseTo(0.5, 9);
  });

  it('|+i⟩ es certeza en Y aunque sea 50/50 en Z: la fase importa en otras bases', () => {
    const p = measurementProbabilities(toBlochVector(P / 2, P / 2));
    expect(p.y.plus).toBeCloseTo(1, 9);
    expect(p.z.plus).toBeCloseTo(0.5, 9);
    expect(p.x.plus).toBeCloseTo(0.5, 9);
  });

  it('en la base Z coincide con |α|² y |β|²', () => {
    const theta = 1.1;
    const p = measurementProbabilities(toBlochVector(theta, 2.3));
    expect(p.z.plus).toBeCloseTo(Math.cos(theta / 2) ** 2, 9);
    expect(p.z.minus).toBeCloseTo(Math.sin(theta / 2) ** 2, 9);
  });
});

describe('círculo de Bloch', () => {
  it('α recorre |0⟩ → |+⟩ → |1⟩ → |−⟩', () => {
    expect(circleAngleFromState(KET_STATES.zero)).toBeCloseTo(0, 9);
    expect(circleAngleFromState(KET_STATES.plus)).toBeCloseTo(P / 2, 9);
    expect(circleAngleFromState(KET_STATES.one)).toBeCloseTo(P, 9);
    expect(circleAngleFromState(KET_STATES.minus)).toBeCloseTo((3 * P) / 2, 9);
  });

  it('stateFromCircleAngle invierte circleAngleFromState', () => {
    for (const alpha of [0, 0.4, P / 2, 2.9, P, 4.0, (3 * P) / 2, 6.0]) {
      expect(circleAngleFromState(stateFromCircleAngle(alpha))).toBeCloseTo(alpha, 9);
    }
    expectAngles(stateFromCircleAngle(4.0), { theta: 2 * P - 4.0, phi: P });
  });

  it('detecta y proyecta estados fuera del plano XZ', () => {
    const plusI = toBlochVector(P / 2, P / 2);
    expect(isOnCircle(plusI)).toBe(false);
    expect(isOnCircle(toBlochVector(P / 3, 0))).toBe(true);
    expectVector(projectToCircle({ x: 0.6, y: 0.8, z: 0 }), { x: 1, y: 0, z: 0 });
    expectVector(projectToCircle(plusI), { x: 0, y: 0, z: 1 });
  });

  it('S saca del círculo a |+⟩ pero X, Z y H no', () => {
    const plus = toBlochVector(P / 2, 0);
    expect(isOnCircle(applyGateToVector('S', plus))).toBe(false);
    for (const gate of ['X', 'Z', 'H']) {
      expect(isOnCircle(applyGateToVector(gate, plus))).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Espacio de Hilbert: amplitudes, matrices, matriz de densidad
// ---------------------------------------------------------------------------

const expectComplex = (got: Complex, want: Complex) => {
  expect(got.re).toBeCloseTo(want.re, 9);
  expect(got.im).toBeCloseTo(want.im, 9);
};

const expectMatrix = (got: Matrix2, want: Matrix2) => {
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) expectComplex(got[i][j], want[i][j]);
  }
};

const Z_AXIS: BlochVector = { x: 0, y: 0, z: 1 };
const X_AXIS: BlochVector = { x: 1, y: 0, z: 0 };
const Y_AXIS: BlochVector = { x: 0, y: 1, z: 0 };

// Polos, ecuador y dos estados genéricos con y ≠ 0 (un error de conjugación invertiría y)
const SAMPLE_STATES: SphericalAngles[] = [KET_0, KET_1, KET_PLUS, KET_PLUS_I, { theta: 1.1, phi: 2.3 }, { theta: 0.4, phi: -1.9 }];

describe('amplitudes y espinor', () => {
  it('|ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩ con α real y ≥ 0', () => {
    const { alpha, beta } = amplitudes({ theta: 1.1, phi: 2.3 });
    expectComplex(alpha, { re: Math.cos(0.55), im: 0 });
    expectComplex(beta, { re: Math.sin(0.55) * Math.cos(2.3), im: Math.sin(0.55) * Math.sin(2.3) });
  });

  it('en los polos ignora φ: ahí sería una fase global', () => {
    const north = amplitudes({ theta: 0, phi: 0.65 });
    expectComplex(north.alpha, { re: 1, im: 0 });
    expectComplex(north.beta, { re: 0, im: 0 });
    const south = amplitudes({ theta: P, phi: 0.65 });
    expectComplex(south.alpha, { re: 0, im: 0 });
    expectComplex(south.beta, { re: 1, im: 0 });
  });

  it('spinorToBlochVector invierte amplitudes', () => {
    for (const s of SAMPLE_STATES) {
      expectVector(spinorToBlochVector(amplitudes(s)), toBlochVector(s.theta, s.phi));
    }
  });

  it('isPole detecta θ = 0 y θ = π', () => {
    expect(isPole(0)).toBe(true);
    expect(isPole(P)).toBe(true);
    expect(isPole(1e-12)).toBe(true);
    expect(isPole(P / 2)).toBe(false);
    expect(isPole(0.01)).toBe(false);
  });
});

describe('compuertas como matrices: SU(2) y SO(3)', () => {
  it('el catálogo de matrices tiene las mismas compuertas que el de rotaciones', () => {
    expect(Object.keys(GATE_UNITARIES).sort()).toEqual(Object.keys(GATE_ROTATIONS).sort());
  });

  it('cada matriz es e^{iγ}·R_n̂(α) con el eje y el ángulo de su rotación', () => {
    for (const [name, { matrix, globalPhase }] of Object.entries(GATE_UNITARIES)) {
      const { axis, angle } = GATE_ROTATIONS[name];
      expectMatrix(matrix, matScale(rotationMatrix(axis, angle), cexp(globalPhase)));
    }
  });

  it('son unitarias: U·U† = I', () => {
    for (const { matrix } of Object.values(GATE_UNITARIES)) {
      expectMatrix(matMul(matrix, matAdjoint(matrix)), IDENTITY);
    }
  });

  it('T·T = S, S·S = Z y H·H = I como matrices', () => {
    const { X, Z, H, S, T } = GATE_UNITARIES;
    expectMatrix(matMul(T.matrix, T.matrix), S.matrix);
    expectMatrix(matMul(S.matrix, S.matrix), Z.matrix);
    expectMatrix(matMul(H.matrix, H.matrix), IDENTITY);
    expectMatrix(matMul(X.matrix, X.matrix), IDENTITY);
  });

  it('el camino de Hilbert (U|ψ⟩) coincide con la rotación de Rodrigues', () => {
    for (const s of SAMPLE_STATES) {
      for (const name of Object.keys(GATE_UNITARIES)) {
        const viaHilbert = spinorToBlochVector(applyMatrix(GATE_UNITARIES[name].matrix, amplitudes(s)));
        expectVector(viaHilbert, applyGateToVector(name, toBlochVector(s.theta, s.phi)));
      }
    }
  });

  it('R_n̂(2π) = −I y R_n̂(4π) = I: doble recubrimiento', () => {
    const axis = { x: 0.6, y: 0, z: 0.8 };
    expectMatrix(rotationMatrix(axis, 2 * P), matScale(IDENTITY, { re: -1, im: 0 }));
    expectMatrix(rotationMatrix(axis, 4 * P), IDENTITY);
  });

  it('R_z(φ)·R_y(θ)|0⟩ es el estado (θ, φ) salvo la fase global e^{−iφ/2}', () => {
    const state = { theta: 1.1, phi: 2.3 };
    const U = matMul(rotationMatrix(Z_AXIS, state.phi), rotationMatrix(Y_AXIS, state.theta));
    const s = applyMatrix(U, amplitudes(KET_0));
    expectVector(spinorToBlochVector(s), toBlochVector(state.theta, state.phi));
    const canonical = amplitudes(state);
    expectComplex(cmul(s.alpha, cexp(state.phi / 2)), canonical.alpha);
    expectComplex(cmul(s.beta, cexp(state.phi / 2)), canonical.beta);
  });
});

describe('matriz de densidad', () => {
  it('ρ = |ψ⟩⟨ψ| para estados puros', () => {
    for (const s of SAMPLE_STATES) {
      const { alpha, beta } = amplitudes(s);
      const outer: Matrix2 = [
        [cmul(alpha, cconj(alpha)), cmul(alpha, cconj(beta))],
        [cmul(beta, cconj(alpha)), cmul(beta, cconj(beta))],
      ];
      expectMatrix(densityMatrix(toBlochVector(s.theta, s.phi)), outer);
    }
  });

  it('es hermítica, de traza 1 y Tr(ρσᵢ) = rᵢ', () => {
    const v = toBlochVector(1.1, 2.3);
    const rho = densityMatrix(v);
    expectMatrix(matAdjoint(rho), rho);
    expectComplex(trace(rho), { re: 1, im: 0 });
    expectComplex(trace(matMul(rho, PAULI.x)), { re: v.x, im: 0 });
    expectComplex(trace(matMul(rho, PAULI.y)), { re: v.y, im: 0 });
    expectComplex(trace(matMul(rho, PAULI.z)), { re: v.z, im: 0 });
  });

  it('la pureza es 1 en la superficie y ½ en el centro', () => {
    expect(purity(toBlochVector(1.1, 2.3))).toBeCloseTo(1, 9);
    expect(purity({ x: 0, y: 0, z: 0 })).toBeCloseTo(0.5, 9);
    expect(purity({ x: 0.3, y: 0, z: 0.4 })).toBeCloseTo(0.625, 9);
  });
});

describe('ángulo entre estados y solapamiento', () => {
  it('|⟨ψ₁|ψ₂⟩|² = cos²(θ_B/2)', () => {
    const a = toBlochVector(1.1, 2.3);
    const b = toBlochVector(0.4, -1.9);
    expect(fidelity(a, b)).toBeCloseTo(Math.cos(angleBetween(a, b) / 2) ** 2, 9);
  });

  it('ortogonal es antípoda (180°), no 90°', () => {
    const zero = toBlochVector(0, 0);
    const one = toBlochVector(P, 0);
    const plus = toBlochVector(P / 2, 0);
    expect(angleBetween(zero, one)).toBeCloseTo(P, 9);
    expect(fidelity(zero, one)).toBeCloseTo(0, 9);
    expect(angleBetween(zero, plus)).toBeCloseTo(P / 2, 9);
    expect(fidelity(zero, plus)).toBeCloseTo(0.5, 9);
    expect(angleBetween(plus, plus)).toBeCloseTo(0, 9);
    expect(fidelity(plus, plus)).toBeCloseTo(1, 9);
  });

  it('coincide con las probabilidades de medición en cada eje', () => {
    const v = toBlochVector(1.1, 2.3);
    const p = measurementProbabilities(v);
    expect(fidelity(v, Z_AXIS)).toBeCloseTo(p.z.plus, 9);
    expect(fidelity(v, X_AXIS)).toBeCloseTo(p.x.plus, 9);
    expect(fidelity(v, Y_AXIS)).toBeCloseTo(p.y.plus, 9);
  });

  it('angleBetween no da NaN ni pierde precisión para vectores casi iguales', () => {
    const angle = angleBetween(Z_AXIS, normalize({ x: 1e-9, y: 0, z: 1 }));
    expect(Number.isNaN(angle)).toBe(false);
    expect(angle).toBeCloseTo(1e-9, 12);
  });
});

describe('estado aleatorio uniforme (Haar)', () => {
  const sequence = (...values: number[]) => {
    let i = 0;
    return () => values[i++ % values.length];
  };

  it('cos θ es uniforme: u = 0, ½, 1 dan θ = 0, 90°, 180°', () => {
    expect(randomState(sequence(0, 0.5)).theta).toBeCloseTo(0, 9);
    expect(randomState(sequence(0.5, 0.5)).theta).toBeCloseTo(P / 2, 9);
    expect(randomState(sequence(1, 0.5)).theta).toBeCloseTo(P, 9);
    for (const u of [0.1, 0.37, 0.8]) {
      expect(Math.cos(randomState(sequence(u, 0.5)).theta)).toBeCloseTo(1 - 2 * u, 9);
    }
  });

  it('φ queda en (−π, π]', () => {
    expect(randomState(sequence(0.5, 0)).phi).toBeCloseTo(P, 9);
    expect(randomState(sequence(0.5, 0.75)).phi).toBeCloseTo(-P / 2, 9);
    expect(randomState(sequence(0.5, 0.999999)).phi).toBeGreaterThan(-P);
  });
});
