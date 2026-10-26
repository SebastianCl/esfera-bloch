// Formato de números complejos para la interfaz. Vive en src/lib (y no en un
// componente) para no romper la regla react-refresh/only-export-components.

import type { Complex } from './complex';

/** Redondea a `digits` decimales sin producir "-0.000": lo que redondea a cero se escribe 0. */
const fixed = (value: number, digits: number): string => {
  const rounded = Number(value.toFixed(digits));
  return (rounded === 0 ? 0 : rounded).toFixed(digits);
};

/** Número complejo con decimales: "0.707", "0.500i", "0.250 - 0.433i". */
export const formatComplex = (c: Complex, digits = 3): string => {
  const re = fixed(c.re, digits);
  const im = fixed(c.im, digits);
  if (Number(im) === 0) return re;
  if (Number(re) === 0) return `${im}i`;
  const sign = Number(im) < 0 ? '-' : '+';
  return `${re} ${sign} ${fixed(Math.abs(c.im), digits)}i`;
};

const SQRT1_2 = Math.SQRT1_2;
const near = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9;

/** Símbolo exacto de un real "bonito" (0, ±1, ±1/√2); null si no lo es. */
const exactReal = (x: number): string | null => {
  if (near(x, 0)) return '0';
  if (near(x, 1)) return '1';
  if (near(x, -1)) return '−1';
  if (near(x, SQRT1_2)) return '1/√2';
  if (near(x, -SQRT1_2)) return '−1/√2';
  return null;
};

/**
 * Número complejo con símbolos exactos, para las matrices de las compuertas:
 * 0, ±1, ±i, ±1/√2, ±i/√2 y (1 ± i)/√2 = e^(±iπ/4). Si no reconoce el valor, decimales.
 */
export const formatComplexExact = (c: Complex): string => {
  if (near(c.im, 0)) {
    const re = exactReal(c.re);
    if (re !== null) return re;
  }
  if (near(c.re, 0)) {
    const im = exactReal(c.im);
    if (im === '1') return 'i';
    if (im === '−1') return '−i';
    if (im === '1/√2') return 'i/√2';
    if (im === '−1/√2') return '−i/√2';
  }
  if (near(c.re, SQRT1_2) && near(c.im, SQRT1_2)) return 'e^(iπ/4)';
  if (near(c.re, SQRT1_2) && near(c.im, -SQRT1_2)) return 'e^(−iπ/4)';
  return formatComplex(c);
};

/**
 * Fase global e^(iγ) como símbolo: 1, i, −1, −i, e^(iπ/4), e^(iπ/8)…
 * Si γ no es una fracción sencilla de π, en grados.
 */
export const formatGlobalPhase = (gamma: number): string => {
  if (near(gamma, 0)) return '1';
  if (near(gamma, Math.PI / 2)) return 'i';
  if (near(gamma, Math.PI) || near(gamma, -Math.PI)) return '−1';
  if (near(gamma, -Math.PI / 2)) return '−i';
  for (const q of [4, 8, 3, 6, 16]) {
    if (near(gamma, Math.PI / q)) return `e^(iπ/${q})`;
    if (near(gamma, -Math.PI / q)) return `e^(−iπ/${q})`;
  }
  return `e^(i·${((gamma * 180) / Math.PI).toFixed(1)}°)`;
};
