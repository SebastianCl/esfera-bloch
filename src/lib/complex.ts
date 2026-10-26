// Aritmética compleja mínima para el espacio de Hilbert del qubit (ℂ²): números,
// vectores de dos componentes y matrices 2×2. Sin React. Lo usa src/lib/bloch.ts
// para las amplitudes, la matriz de densidad y las compuertas como matrices.

export interface Complex {
  re: number;
  im: number;
}

export const complex = (re: number, im = 0): Complex => ({ re, im });

export const ZERO: Complex = { re: 0, im: 0 };
export const ONE: Complex = { re: 1, im: 0 };
/** Unidad imaginaria i. */
export const I_UNIT: Complex = { re: 0, im: 1 };

export const cadd = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });

export const cmul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});

export const cscale = (a: Complex, k: number): Complex => ({ re: a.re * k, im: a.im * k });

export const cconj = (a: Complex): Complex => ({ re: a.re, im: -a.im });

/** Módulo al cuadrado |a|². */
export const cabs2 = (a: Complex): number => a.re * a.re + a.im * a.im;

/** e^{iθ} = cos θ + i sin θ. */
export const cexp = (theta: number): Complex => ({ re: Math.cos(theta), im: Math.sin(theta) });

/** Matriz 2×2 compleja por filas: [[a, b], [c, d]]. */
export type Matrix2 = [[Complex, Complex], [Complex, Complex]];

/** Vector columna de ℂ². */
export type Vector2 = [Complex, Complex];

export const IDENTITY: Matrix2 = [
  [ONE, ZERO],
  [ZERO, ONE],
];

/** Matrices de Pauli σx, σy, σz. */
export const PAULI: Record<'x' | 'y' | 'z', Matrix2> = {
  x: [
    [ZERO, ONE],
    [ONE, ZERO],
  ],
  y: [
    [ZERO, { re: 0, im: -1 }],
    [I_UNIT, ZERO],
  ],
  z: [
    [ONE, ZERO],
    [ZERO, { re: -1, im: 0 }],
  ],
};

export const matAdd = (A: Matrix2, B: Matrix2): Matrix2 => [
  [cadd(A[0][0], B[0][0]), cadd(A[0][1], B[0][1])],
  [cadd(A[1][0], B[1][0]), cadd(A[1][1], B[1][1])],
];

export const matScale = (A: Matrix2, k: Complex): Matrix2 => [
  [cmul(A[0][0], k), cmul(A[0][1], k)],
  [cmul(A[1][0], k), cmul(A[1][1], k)],
];

export const matMul = (A: Matrix2, B: Matrix2): Matrix2 => [
  [cadd(cmul(A[0][0], B[0][0]), cmul(A[0][1], B[1][0])), cadd(cmul(A[0][0], B[0][1]), cmul(A[0][1], B[1][1]))],
  [cadd(cmul(A[1][0], B[0][0]), cmul(A[1][1], B[1][0])), cadd(cmul(A[1][0], B[0][1]), cmul(A[1][1], B[1][1]))],
];

export const matVec = (A: Matrix2, v: Vector2): Vector2 => [
  cadd(cmul(A[0][0], v[0]), cmul(A[0][1], v[1])),
  cadd(cmul(A[1][0], v[0]), cmul(A[1][1], v[1])),
];

/** Adjunta A† (transpuesta conjugada). */
export const matAdjoint = (A: Matrix2): Matrix2 => [
  [cconj(A[0][0]), cconj(A[1][0])],
  [cconj(A[0][1]), cconj(A[1][1])],
];

export const trace = (A: Matrix2): Complex => cadd(A[0][0], A[1][1]);
