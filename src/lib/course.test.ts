import { describe, expect, it } from 'vitest';
import {
  applyGate,
  GATE_ROTATIONS,
  isOnCircle,
  KET_STATES,
  ketKeyOf,
  projectToCircle,
  stateFromCircleAngle,
  toBlochVector,
  toSpherical,
  type KetKey,
  type SphericalAngles,
} from './bloch';
import type { ViewMode } from './modes';
import {
  angles,
  CHAPTER_SLUGS,
  CHAPTERS,
  chapterNumber,
  DEMOS,
  EXERCISES,
  labelText,
  nextChapter,
  prevChapter,
  sphereActionLabel,
  type Label,
  type Sequence,
  type SphereAction,
} from './course';

/**
 * Plegado de una secuencia con las mismas reglas que useQubit.run (solo para
 * este test; en runtime la única implementación es el hook): preset y angles
 * fijan el estado, gate lo rota, circle lo pone en el plano XZ y en modo
 * círculo, mode círculo proyecta si hace falta, y cualquier estado fuera del
 * plano en modo círculo devuelve a la esfera completa.
 */
function finalStateOf(steps: SphereAction[], start: SphericalAngles = KET_STATES.zero) {
  let state = start;
  let viewMode: ViewMode = 'libre';
  for (const action of steps) {
    switch (action.type) {
      case 'preset':
        if (action.key === 'random') throw new Error('random no vale en una secuencia');
        state = KET_STATES[action.key];
        break;
      case 'gate':
        state = applyGate(action.gate, state);
        break;
      case 'angles':
        state = { theta: action.theta, phi: action.phi };
        break;
      case 'circle':
        state = stateFromCircleAngle(action.alpha);
        viewMode = 'circulo';
        break;
      case 'mode': {
        viewMode = action.mode;
        const v = toBlochVector(state.theta, state.phi);
        if (viewMode === 'circulo' && !isOnCircle(v)) state = toSpherical(projectToCircle(v));
        break;
      }
    }
    if (action.type !== 'mode' && viewMode === 'circulo' && !isOnCircle(toBlochVector(state.theta, state.phi))) {
      viewMode = 'libre';
    }
  }
  return { state, mode: viewMode };
}

const allSequences = (): { where: string; seq: Sequence }[] => {
  const out: { where: string; seq: Sequence }[] = [];
  for (const slug of CHAPTER_SLUGS) {
    DEMOS[slug].forEach((seq, i) => out.push({ where: `DEMOS.${slug}[${i}]`, seq }));
    const ex = EXERCISES[slug];
    out.push({ where: `EXERCISES.${slug}.setup`, seq: { steps: ex.setup, expectKet: ex.expectKet } });
    ex.checks?.forEach((seq, i) => out.push({ where: `EXERCISES.${slug}.checks[${i}]`, seq }));
  }
  return out;
};

const allLabels = (): { where: string; label: Label }[] => {
  const out: { where: string; label: Label }[] = [];
  for (const { where, seq } of allSequences()) {
    if (seq.label) out.push({ where, label: seq.label });
    seq.steps.forEach((a, i) => out.push({ where: `${where}.steps[${i}]`, label: sphereActionLabel(a) }));
  }
  return out;
};

describe('registro de capítulos', () => {
  it('tiene diez slugs únicos en el orden de las lecciones', () => {
    expect(CHAPTERS.map((c) => c.slug)).toEqual([...CHAPTER_SLUGS]);
    expect(new Set(CHAPTER_SLUGS).size).toBe(10);
    expect(CHAPTER_SLUGS[0]).toBe('fasor');
    expect(CHAPTER_SLUGS[9]).toBe('errores');
    expect(chapterNumber('circulo')).toBe(3);
  });

  it('anterior y siguiente son simétricos y nulos en los extremos', () => {
    expect(prevChapter('fasor')).toBeNull();
    expect(nextChapter('errores')).toBeNull();
    for (const c of CHAPTERS) {
      const next = nextChapter(c.slug);
      if (next) expect(prevChapter(next.slug)?.slug).toBe(c.slug);
    }
  });

  it('las fuentes son procedencia legible, sin notas de implementación', () => {
    for (const c of CHAPTERS) expect(c.source).toMatch(/^(Lección 3[01]|Investigación), §/);
  });
});

describe('acciones y etiquetas', () => {
  it('redondea los ángulos a grados enteros', () => {
    expect(labelText(sphereActionLabel(angles(60, 0)), 'curso')).toBe('θ = 60°, φ = 0°');
  });

  it('usa la notación pedida para los kets', () => {
    const label = sphereActionLabel({ type: 'preset', key: 'plusI' });
    expect(labelText(label, 'curso')).toBe('Ir a |i⟩');
    expect(labelText(label, 'computacional')).toBe('Ir a |+i⟩');
  });

  it('no escribe ningún ket a mano en course.ts', () => {
    for (const { where, label } of allLabels()) {
      for (const part of label) {
        if ('text' in part) expect(part.text, where).not.toContain('⟩');
      }
    }
    for (const c of CHAPTERS) expect(c.title + c.source).not.toContain('⟩');
  });

  it('las secuencias de varios pasos llevan etiqueta de grupo', () => {
    for (const { where, seq } of allSequences()) {
      if (seq.steps.length > 1 && !where.endsWith('.setup')) expect(seq.label, where).toBeDefined();
    }
  });
});

describe('demostraciones y ejercicios', () => {
  it('solo usan compuertas y presets que existen, y nunca random', () => {
    for (const { where, seq } of allSequences()) {
      for (const a of seq.steps) {
        if (a.type === 'gate') expect(GATE_ROTATIONS[a.gate], where).toBeDefined();
        if (a.type === 'preset') {
          if (where.startsWith('DEMOS')) {
            if (a.key !== 'random') expect(KET_STATES[a.key], where).toBeDefined();
          } else {
            expect(a.key, where).not.toBe('random');
          }
        }
        if (a.type === 'circle') expect(a.alpha, where).toBeLessThan(2 * Math.PI);
      }
    }
  });

  it('cada comprobación de un ejercicio empieza fijando el estado', () => {
    for (const slug of CHAPTER_SLUGS) {
      for (const check of EXERCISES[slug].checks ?? []) {
        expect(['preset', 'angles', 'circle'], `EXERCISES.${slug}`).toContain(check.steps[0].type);
      }
    }
  });

  it('cada secuencia con expectKet llega a ese autoestado desde |0⟩', () => {
    for (const { where, seq } of allSequences()) {
      if (!seq.expectKet) continue;
      if (seq.steps.some((a) => a.type === 'preset' && a.key === 'random')) continue;
      const { state } = finalStateOf(seq.steps);
      expect(ketKeyOf(state), where).toBe(seq.expectKet);
    }
  });

  it('las demostraciones del círculo salen de él cuando toca', () => {
    const dentro = DEMOS['eje-y'][0];
    const { state, mode } = finalStateOf(dentro.steps);
    expect(ketKeyOf(state)).toBe('plusI');
    expect(mode).toBe('libre');

    const circulo = finalStateOf(EXERCISES.circulo.setup);
    expect(circulo.mode).toBe('circulo');
    expect(circulo.state.theta).toBeCloseTo(Math.PI / 3);
    expect(circulo.state.phi).toBeCloseTo(0);
  });

  it('cubre los casos de referencia de las lecciones', () => {
    const expectKet = (steps: SphereAction[], key: KetKey) => expect(ketKeyOf(finalStateOf(steps).state)).toBe(key);
    expectKet([{ type: 'preset', key: 'plus' }, { type: 'gate', gate: 'Z' }, { type: 'gate', gate: 'H' }], 'one');
    expectKet([{ type: 'preset', key: 'zero' }, { type: 'gate', gate: 'H' }], 'plus');
    expectKet([{ type: 'preset', key: 'plus' }, { type: 'gate', gate: 'S' }], 'plusI');
    expectKet([{ type: 'preset', key: 'plus' }, { type: 'gate', gate: 'X' }], 'plus');
    expectKet([{ type: 'circle', alpha: Math.PI }], 'one');
  });
});
