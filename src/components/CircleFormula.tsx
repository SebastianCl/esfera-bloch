import { circleAngleFromState, type SphericalAngles } from '@/lib/bloch';
import { formatComplex } from '@/lib/format';
import { ket, type Notation } from '@/lib/notation';

interface CircleFormulaProps {
  state: SphericalAngles;
  notation: Notation;
}

/**
 * Forma del círculo de Bloch, cos(α/2)|0⟩ + sin(α/2)|1⟩ (lección 30), con las
 * amplitudes del estado actual y, cuando α > 180°, la nota del signo: la fórmula
 * da las amplitudes con el signo opuesto, una fase global −1, el mismo estado.
 * Solo tiene sentido con el estado en el plano XZ (modo círculo).
 */
export function CircleFormula({ state, notation }: CircleFormulaProps) {
  const k0 = ket('zero', notation);
  const k1 = ket('one', notation);
  const alpha = circleAngleFromState(state);
  const flipsSign = alpha > Math.PI + 1e-9;

  return (
    <>
      <div className="math-formula text-center py-2 mt-2 text-xs">
        Círculo: cos(α/2){k0} + sin(α/2){k1} = {formatComplex({ re: Math.cos(alpha / 2), im: 0 })}
        {k0} + ({formatComplex({ re: Math.sin(alpha / 2), im: 0 })}){k1}
      </div>
      {flipsSign && (
        <p className="text-xs text-muted-foreground mt-2">
          Con α &gt; 180° la fórmula del círculo da las amplitudes con el signo opuesto a las de arriba. Ese −1 multiplica
          a todo el estado: es una fase global, no se puede medir y describe el mismo punto de la esfera. No es el signo
          entre {k0} y {k1} (φ = 180°), que es una fase relativa y sí distingue {ket('minus', notation)} de{' '}
          {ket('plus', notation)}.
        </p>
      )}
    </>
  );
}
