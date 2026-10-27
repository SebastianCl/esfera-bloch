import type { KetKey, SphericalAngles } from './bloch';
import { VIEW_MODES, type ViewMode } from './modes';
import type { Notation } from './notation';
import { ket } from './notation';

/**
 * Datos del curso de teoría (/teoria), sin React: el registro de capítulos, las
 * acciones que los botones ejecutan sobre la esfera y las demostraciones y
 * ejercicios de cada capítulo. La prosa vive en src/components/teoria/chapters.
 * course.test.ts comprueba contra bloch.ts que cada secuencia llega a donde dice.
 */

// ---------------------------------------------------------------------------
// Capítulos
// ---------------------------------------------------------------------------

export const CHAPTER_SLUGS = [
  'fasor',
  'hilbert-born',
  'circulo',
  'eje-y',
  'autoestados',
  'coordenadas',
  'compuertas',
  'medicion',
  'densidad',
  'errores',
] as const;

export type ChapterSlug = (typeof CHAPTER_SLUGS)[number];

export interface ChapterInfo {
  slug: ChapterSlug;
  title: string;
  /** Procedencia legible por el alumno (va en el kicker del capítulo). */
  source: string;
}

export const CHAPTERS: ChapterInfo[] = [
  { slug: 'fasor', title: 'Del fasor al estado cuántico', source: 'Lección 30, §1–2' },
  { slug: 'hilbert-born', title: 'Espacio de Hilbert y regla de Born', source: 'Lección 30, §1 y §3' },
  { slug: 'circulo', title: 'El círculo de Bloch', source: 'Lección 30, §4' },
  { slug: 'eje-y', title: 'Gauss, el plano complejo y el eje Y', source: 'Lección 31, §1, §2 y §4' },
  { slug: 'autoestados', title: 'Los seis autoestados', source: 'Lección 31, §3 y §5' },
  { slug: 'coordenadas', title: 'Coordenadas sobre la esfera: θ y φ', source: 'Investigación, §1' },
  { slug: 'compuertas', title: 'Compuertas como rotaciones', source: 'Investigación, §2' },
  { slug: 'medicion', title: 'Medir en otras bases', source: 'Investigación, §4' },
  { slug: 'densidad', title: 'La matriz de densidad y el interior de la esfera', source: 'Investigación, §1' },
  { slug: 'errores', title: 'Errores conceptuales frecuentes', source: 'Investigación, §4' },
];

export const chapterIndex = (slug: ChapterSlug): number => CHAPTERS.findIndex((c) => c.slug === slug);
/** Número del capítulo tal como lo ve el alumno (desde 1). */
export const chapterNumber = (slug: ChapterSlug): number => chapterIndex(slug) + 1;
export const chapterInfo = (slug: ChapterSlug): ChapterInfo => CHAPTERS[chapterIndex(slug)];
export const prevChapter = (slug: ChapterSlug): ChapterInfo | null => CHAPTERS[chapterIndex(slug) - 1] ?? null;
export const nextChapter = (slug: ChapterSlug): ChapterInfo | null => CHAPTERS[chapterIndex(slug) + 1] ?? null;

// ---------------------------------------------------------------------------
// Etiquetas: nunca un ket escrito a mano. Las partes se renderizan en orden; el
// ket sale por ket(key, notation) y los números en monoespaciada.
// ---------------------------------------------------------------------------

export type LabelPart = { text: string; mono?: boolean } | { ket: KetKey };
export type Label = LabelPart[];

export const t = (text: string): LabelPart => ({ text });
export const m = (text: string): LabelPart => ({ text, mono: true });
export const k = (key: KetKey): LabelPart => ({ ket: key });

/** Texto plano de una etiqueta (para aria-label y tests). */
export const labelText = (label: Label, notation: Notation): string =>
  label.map((part) => ('ket' in part ? ket(part.ket, notation) : part.text)).join(' ');

// ---------------------------------------------------------------------------
// Acciones sobre la esfera. Un clic ejecuta una acción (useQubit.run).
// ---------------------------------------------------------------------------

export type SphereAction = (
  | { type: 'preset'; key: KetKey | 'random' }
  | { type: 'gate'; gate: string }
  | { type: 'mode'; mode: ViewMode }
  | { type: 'angles'; theta: number; phi: number }
  | { type: 'circle'; alpha: number }
) & { label?: Label };

const rad = (deg: number) => (deg * Math.PI) / 180;
const degreesOf = (radians: number) => Math.round((radians * 180) / Math.PI);

export const preset = (key: KetKey | 'random', label?: Label): SphereAction => ({ type: 'preset', key, label });
export const gate = (name: string, label?: Label): SphereAction => ({ type: 'gate', gate: name, label });
export const mode = (value: ViewMode, label?: Label): SphereAction => ({ type: 'mode', mode: value, label });
/** Ángulos en grados, como los lee el alumno. */
export const angles = (thetaDeg: number, phiDeg: number, label?: Label): SphereAction => ({
  type: 'angles',
  theta: rad(thetaDeg),
  phi: rad(phiDeg),
  label,
});
/** Ángulo del círculo de Bloch en grados; la acción también pone el modo círculo. */
export const circle = (alphaDeg: number, label?: Label): SphereAction => ({ type: 'circle', alpha: rad(alphaDeg), label });

export function sphereActionLabel(action: SphereAction): Label {
  if (action.label) return action.label;
  switch (action.type) {
    case 'preset':
      return action.key === 'random' ? [t('Estado aleatorio')] : [t('Ir a'), k(action.key)];
    case 'gate':
      return [t(`Aplicar ${action.gate}`)];
    case 'mode':
      return [t(VIEW_MODES.find((v) => v.value === action.mode)?.label ?? action.mode)];
    case 'angles':
      return [t('θ ='), m(`${degreesOf(action.theta)}°,`), t('φ ='), m(`${degreesOf(action.phi)}°`)];
    case 'circle':
      return [t('α ='), m(`${degreesOf(action.alpha)}°`)];
  }
}

// ---------------------------------------------------------------------------
// Demostraciones («En la esfera») y ejercicios de cada capítulo
// ---------------------------------------------------------------------------

export interface Sequence {
  /** Etiqueta del grupo (obligatoria si hay más de un paso). Con un solo paso, la del botón. */
  label?: Label;
  steps: SphereAction[];
  /** Autoestado al que debe llegar la secuencia desde |0⟩ (lo comprueba el test). */
  expectKet?: KetKey;
}

const one = (action: SphereAction): Sequence => ({ steps: [action] });

export const DEMOS: Record<ChapterSlug, Sequence[]> = {
  fasor: [
    one(mode('libre')),
    one(preset('zero', [t('Ver la flecha en'), k('zero')])),
    one(angles(60, 0, [t('Una superposición: θ ='), m('60°')])),
    one(preset('random', [t('Estado aleatorio: cambia la dirección, no la longitud')])),
  ],
  'hilbert-born': [
    one(preset('plus', [k('plus'), t(': 50 / 50 en Z')])),
    one(preset('minus', [k('minus'), t(': también 50 / 50 en Z')])),
    one(angles(60, 0, [t('θ ='), m('60°'), t(': cos²(30°) = 75 %')])),
  ],
  circulo: [
    one(mode('circulo', [t('Ver el círculo de Bloch')])),
    one(circle(90, [t('α ='), m('90°:'), k('plus')])),
    one(circle(45)),
    one(circle(270, [t('α ='), m('270°:'), k('minus'), t('con el signo cambiado')])),
  ],
  'eje-y': [
    {
      label: [t('Dentro del círculo')],
      steps: [mode('circulo'), preset('plus'), gate('S', [t('Multiplicar'), k('one'), t('por i (compuerta S)')])],
      expectKet: 'plusI',
    },
    one(mode('polo', [t('Ver desde el polo')])),
    one(preset('plusI')),
    one(preset('minusI')),
    {
      label: [t('Dar la vuelta al plano complejo')],
      steps: [preset('plus'), preset('plusI'), preset('minus'), preset('minusI')],
      expectKet: 'minusI',
    },
  ],
  autoestados: [
    {
      label: [t('Recorrer los seis')],
      steps: [preset('zero'), preset('one'), preset('plus'), preset('minus'), preset('plusI'), preset('minusI')],
      expectKet: 'minusI',
    },
    one(mode('polo', [t('Leer el ecuador como +1, +i, −1, −i')])),
  ],
  coordenadas: [
    one(angles(60, 0)),
    { label: [t('Girar solo φ')], steps: [angles(60, 0), angles(60, 90), angles(60, 180)] },
    {
      label: [t('Bajar solo θ')],
      steps: [angles(0, 0), angles(60, 0), angles(120, 0), angles(180, 0)],
      expectKet: 'one',
    },
    one(preset('zero', [t('Al polo: φ indefinida')])),
  ],
  compuertas: [
    { label: [t('H sobre'), k('zero')], steps: [preset('zero'), gate('H')], expectKet: 'plus' },
    { label: [t('H dos veces')], steps: [preset('zero'), gate('H'), gate('H')], expectKet: 'zero' },
    {
      label: [t('S cuatro veces')],
      steps: [preset('plus'), gate('S'), gate('S'), gate('S'), gate('S')],
      expectKet: 'plus',
    },
    { label: [t('T dos veces = S')], steps: [preset('plus'), gate('T'), gate('T')], expectKet: 'plusI' },
  ],
  medicion: [
    {
      label: [k('plus'), t('e'), k('plusI'), t(': mismas probabilidades en Z')],
      steps: [preset('plus'), preset('plusI')],
      expectKet: 'plusI',
    },
    { label: [t('Interferencia:'), k('plus'), t('→ Z → H')], steps: [preset('plus'), gate('Z'), gate('H')], expectKet: 'one' },
    { label: [t('Sin la Z:'), k('plus'), t('→ H')], steps: [preset('plus'), gate('H')], expectKet: 'zero' },
    one(preset('plus', [t('A 90° de'), k('zero'), t(': solapamiento ½')])),
  ],
  densidad: [
    one(preset('plus', [t('ρ de'), k('plus')])),
    one(preset('plusI', [t('ρ de'), k('plusI'), t('(coherencias imaginarias)')])),
    { label: [t('Girar φ: la diagonal no cambia')], steps: [angles(60, 0), angles(60, 120)] },
    one(preset('zero', [t('Al polo: sin coherencias')])),
  ],
  errores: [
    // (a) ortogonal es 180°
    one(preset('zero', [k('zero'), t('frente a'), k('plus'), t(': X 50 / 50')])),
    one(preset('one', [t('La antípoda:'), k('one')])),
    {
      label: [t('Recorrer θ_B')],
      steps: [angles(0, 0), angles(60, 0), angles(90, 0), angles(120, 0), angles(180, 0)],
      expectKet: 'one',
    },
    // (b) la flecha no es una carga girando
    { label: [t('Aplicar X a'), k('zero')], steps: [preset('zero'), gate('X')], expectKet: 'one' },
    // (c) fase relativa frente a global
    one(preset('plus')),
    one(preset('minus')),
    { label: [k('plus'), t('→ Z → H')], steps: [preset('plus'), gate('Z'), gate('H')], expectKet: 'one' },
    { label: [k('plus'), t('→ H')], steps: [preset('plus'), gate('H')], expectKet: 'zero' },
  ],
};

export interface Exercise {
  /** Preparación en la esfera antes de ver la respuesta. */
  setup: SphereAction[];
  expectKet?: KetKey;
  /** Comprobaciones dentro de la respuesta; cada una empieza fijando el estado (preset, angles o circle). */
  checks?: Sequence[];
}

export const EXERCISES: Record<ChapterSlug, Exercise> = {
  fasor: { setup: [preset('zero'), preset('plus')], expectKet: 'plus' },
  'hilbert-born': { setup: [preset('plus'), preset('minus')], expectKet: 'minus' },
  circulo: {
    setup: [circle(60)],
    checks: [{ label: [t('Y a 180°')], steps: [circle(180)], expectKet: 'one' }],
  },
  'eje-y': { setup: [mode('polo'), angles(90, 90)], expectKet: 'plusI' },
  autoestados: { setup: [preset('minusI')], expectKet: 'minusI' },
  coordenadas: {
    setup: [angles(120, 90)],
    checks: [{ label: [t('Ahora φ = −90°')], steps: [angles(120, -90)] }],
  },
  compuertas: {
    setup: [preset('zero'), gate('H')],
    expectKet: 'plus',
    checks: [
      { label: [t('Desde'), k('plus'), t(', S')], steps: [preset('plus'), gate('S')], expectKet: 'plusI' },
      { label: [t('Desde'), k('plus'), t(', Z')], steps: [preset('plus'), gate('Z')], expectKet: 'minus' },
      { label: [t('Desde'), k('plus'), t(', X')], steps: [preset('plus'), gate('X')], expectKet: 'plus' },
    ],
  },
  medicion: {
    setup: [angles(60, 0)],
    checks: [{ label: [t('A 180°:'), k('one')], steps: [preset('one')], expectKet: 'one' }],
  },
  densidad: {
    setup: [preset('plusI')],
    expectKet: 'plusI',
    checks: [{ label: [t('Ahora'), k('minusI')], steps: [preset('minusI')], expectKet: 'minusI' }],
  },
  errores: {
    setup: [preset('zero')],
    expectKet: 'zero',
    checks: [
      { label: [t('(1) X 50 / 50 desde'), k('zero')], steps: [preset('zero')], expectKet: 'zero' },
      { label: [t('(2) En'), k('zero'), t(': Z 100 / 0, pero X e Y 50 / 50')], steps: [preset('zero')], expectKet: 'zero' },
      { label: [t('(3)'), k('plus'), t('→ Z → H')], steps: [preset('plus'), gate('Z'), gate('H')], expectKet: 'one' },
    ],
  },
};

/** Lo que recibe cada componente de capítulo. */
export interface ChapterProps {
  notation: Notation;
  state: SphericalAngles;
  mode: ViewMode;
  run: (action: SphereAction) => void;
}
