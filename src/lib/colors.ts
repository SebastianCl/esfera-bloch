import type { BlochVector } from './bloch';

/**
 * Colores de los ejes de la esfera, única fuente para la escena 3D, los iconos
 * de las compuertas y las barras de probabilidad. Son los red/emerald/blue 500
 * de Tailwind (y 600 en tema claro, donde el 500 no llega a 3:1 sobre blanco).
 * `other` es para ejes genéricos, como el de Hadamard.
 */
export type AxisKey = 'x' | 'y' | 'z' | 'other';

export const AXIS_COLORS: Record<AxisKey, string> = {
  x: '#EF4444',
  y: '#10B981',
  z: '#3B82F6',
  other: '#A855F7',
};

export const AXIS_COLORS_LIGHT: Record<AxisKey, string> = {
  x: '#DC2626',
  y: '#059669',
  z: '#2563EB',
  other: '#7E22CE',
};

/** Eje cartesiano al que corresponde un eje de rotación unitario, u `other` si no es ninguno. */
export const axisKeyOf = (axis: BlochVector, tolerance = 1e-9): AxisKey => {
  if (Math.abs(Math.abs(axis.x) - 1) < tolerance) return 'x';
  if (Math.abs(Math.abs(axis.y) - 1) < tolerance) return 'y';
  if (Math.abs(Math.abs(axis.z) - 1) < tolerance) return 'z';
  return 'other';
};

export const axisColor = (axis: BlochVector, theme: 'dark' | 'light' = 'dark'): string =>
  (theme === 'light' ? AXIS_COLORS_LIGHT : AXIS_COLORS)[axisKeyOf(axis)];
