import { describe, expect, it } from 'vitest';
import { KET_KEYS, ketExpression } from './notation';

describe('ketExpression', () => {
  it('escribe los seis autoestados en la base Z con la notación computacional', () => {
    expect(ketExpression('zero', 'computacional')).toBe('|0⟩');
    expect(ketExpression('one', 'computacional')).toBe('|1⟩');
    expect(ketExpression('plus', 'computacional')).toBe('(|0⟩ + |1⟩)/√2');
    expect(ketExpression('minus', 'computacional')).toBe('(|0⟩ − |1⟩)/√2');
    expect(ketExpression('plusI', 'computacional')).toBe('(|0⟩ + i|1⟩)/√2');
    expect(ketExpression('minusI', 'computacional')).toBe('(|0⟩ − i|1⟩)/√2');
  });

  it('usa los nombres del curso cuando se le pide', () => {
    expect(ketExpression('minus', 'curso')).toBe('(|u⟩ − |d⟩)/√2');
    expect(ketExpression('plusI', 'curso')).toBe('(|u⟩ + i|d⟩)/√2');
    expect(ketExpression('zero', 'curso')).toBe('|u⟩');
  });

  it('cubre todas las claves en las dos notaciones', () => {
    for (const key of KET_KEYS) {
      expect(ketExpression(key, 'curso')).toContain('⟩');
      expect(ketExpression(key, 'computacional')).toContain('⟩');
    }
  });
});
