/**
 * Modos de visualización de la esfera.
 * - libre: esfera 3D con cámara libre (vista por defecto).
 * - polo: cámara sobre +Z mirando hacia abajo. El ecuador se ve como el plano
 *   complejo de Gauss (lección 31): X real, Y imaginario.
 * - circulo: círculo de Bloch (lección 30). El estado se restringe al plano XZ
 *   (amplitudes reales) y la cámara mira ese plano de frente.
 */
export type ViewMode = 'libre' | 'polo' | 'circulo';

export const VIEW_MODES: { value: ViewMode; label: string; description: string }[] = [
  { value: 'libre', label: 'Esfera 3D', description: 'Cámara libre: arrastra para girar, rueda para acercar.' },
  { value: 'polo', label: 'Desde el polo', description: 'Vista desde |0⟩: el ecuador es el plano complejo.' },
  { value: 'circulo', label: 'Círculo 2D', description: 'Solo amplitudes reales: el plano XZ de la lección 30.' },
];
