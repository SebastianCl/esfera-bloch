import type { KetKey } from './bloch';

/**
 * Dos formas de nombrar los mismos seis autoestados:
 * - "computacional": la habitual en computación cuántica (|0⟩, |1⟩, |+⟩, …).
 * - "curso": la del curso Mundo Cuántico (lecciones 30 y 31), tomada de
 *   Susskind: up/down para Sz, right/left para Sx, in/out para Sy.
 */
export type Notation = 'computacional' | 'curso';

export const NOTATIONS: Notation[] = ['computacional', 'curso'];

export const NOTATION_NAMES: Record<Notation, string> = {
  computacional: 'Computación cuántica',
  curso: 'Curso (u, d, r, l, i, o)',
};

export const KET_LABELS: Record<Notation, Record<KetKey, string>> = {
  computacional: {
    zero: '|0⟩',
    one: '|1⟩',
    plus: '|+⟩',
    minus: '|−⟩',
    plusI: '|+i⟩',
    minusI: '|−i⟩',
  },
  curso: {
    zero: '|u⟩',
    one: '|d⟩',
    plus: '|r⟩',
    minus: '|l⟩',
    plusI: '|i⟩',
    minusI: '|o⟩',
  },
};

/** Nombre del autoestado en la notación pedida. */
export const ket = (key: KetKey, notation: Notation): string => KET_LABELS[notation][key];

export const KET_KEYS: KetKey[] = ['zero', 'one', 'plus', 'minus', 'plusI', 'minusI'];

/** Expresión de cada autoestado en la base Z, con la notación elegida. */
export const ketExpression = (key: KetKey, notation: Notation): string => {
  const u = ket('zero', notation);
  const d = ket('one', notation);
  switch (key) {
    case 'zero':
      return u;
    case 'one':
      return d;
    case 'plus':
      return `(${u} + ${d})/√2`;
    case 'minus':
      return `(${u} − ${d})/√2`;
    case 'plusI':
      return `(${u} + i${d})/√2`;
    case 'minusI':
      return `(${u} − i${d})/√2`;
  }
};

/** Descripción corta de cada autoestado: operador, orientación y valor en el plano complejo. */
export const KET_INFO: Record<KetKey, { operator: string; axis: string; complex: string; description: string }> = {
  zero: { operator: 'Sz', axis: '+Z', complex: '', description: 'Polo norte' },
  one: { operator: 'Sz', axis: '−Z', complex: '', description: 'Polo sur' },
  plus: { operator: 'Sx', axis: '+X', complex: '+1', description: 'Derecha' },
  minus: { operator: 'Sx', axis: '−X', complex: '−1', description: 'Izquierda' },
  plusI: { operator: 'Sy', axis: '+Y', complex: '+i', description: 'Entrante' },
  minusI: { operator: 'Sy', axis: '−Y', complex: '−i', description: 'Saliente' },
};
