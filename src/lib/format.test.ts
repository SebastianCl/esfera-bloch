import { describe, expect, it } from 'vitest';
import { formatComplex, formatComplexExact, formatGlobalPhase } from './format';

describe('formatComplex', () => {
  it('imprime reales, imaginarios puros y binomios', () => {
    expect(formatComplex({ re: 0.70710678, im: 0 })).toBe('0.707');
    expect(formatComplex({ re: 0, im: 0.5 })).toBe('0.500i');
    expect(formatComplex({ re: 0.25, im: -0.4330127 })).toBe('0.250 - 0.433i');
    expect(formatComplex({ re: -0.5, im: 0.5 })).toBe('-0.500 + 0.500i');
    expect(formatComplex({ re: 0.5, im: 0.25 }, 2)).toBe('0.50 + 0.25i');
  });

  it('nunca imprime -0.000', () => {
    expect(formatComplex({ re: -0.0004, im: 0 })).toBe('0.000');
    expect(formatComplex({ re: 1, im: -0.0004 })).toBe('1.000');
    expect(formatComplex({ re: -0, im: -0 })).toBe('0.000');
    expect(formatComplex({ re: 0, im: -0.0004 })).toBe('0.000');
    expect(formatComplex({ re: 0.5, im: -0.0006 })).toBe('0.500 - 0.001i');
  });
});

describe('formatComplexExact', () => {
  it('reconoce todas las entradas de las compuertas del catálogo', () => {
    expect(formatComplexExact({ re: 0, im: 0 })).toBe('0');
    expect(formatComplexExact({ re: 1, im: 0 })).toBe('1');
    expect(formatComplexExact({ re: -1, im: 0 })).toBe('−1');
    expect(formatComplexExact({ re: 0, im: 1 })).toBe('i');
    expect(formatComplexExact({ re: 0, im: -1 })).toBe('−i');
    expect(formatComplexExact({ re: Math.SQRT1_2, im: 0 })).toBe('1/√2');
    expect(formatComplexExact({ re: -Math.SQRT1_2, im: 0 })).toBe('−1/√2');
    expect(formatComplexExact({ re: 0, im: Math.SQRT1_2 })).toBe('i/√2');
    expect(formatComplexExact({ re: 0, im: -Math.SQRT1_2 })).toBe('−i/√2');
    expect(formatComplexExact({ re: Math.SQRT1_2, im: Math.SQRT1_2 })).toBe('e^(iπ/4)');
    expect(formatComplexExact({ re: Math.SQRT1_2, im: -Math.SQRT1_2 })).toBe('e^(−iπ/4)');
  });

  it('tolera residuos de punto flotante', () => {
    expect(formatComplexExact({ re: 1e-17, im: 1 - 1e-16 })).toBe('i');
  });

  it('cae en decimales para valores genéricos', () => {
    expect(formatComplexExact({ re: 0.3, im: 0.4 })).toBe('0.300 + 0.400i');
    expect(formatComplexExact({ re: 0.5, im: 0 })).toBe('0.500');
  });
});

describe('formatGlobalPhase', () => {
  it('nombra las fases globales del catálogo', () => {
    expect(formatGlobalPhase(0)).toBe('1');
    expect(formatGlobalPhase(Math.PI / 2)).toBe('i');
    expect(formatGlobalPhase(Math.PI)).toBe('−1');
    expect(formatGlobalPhase(-Math.PI / 2)).toBe('−i');
    expect(formatGlobalPhase(Math.PI / 4)).toBe('e^(iπ/4)');
    expect(formatGlobalPhase(Math.PI / 8)).toBe('e^(iπ/8)');
  });

  it('usa grados para fases que no son fracciones sencillas de π', () => {
    expect(formatGlobalPhase(1)).toBe('e^(i·57.3°)');
  });
});
