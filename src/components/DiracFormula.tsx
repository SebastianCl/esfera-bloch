import { amplitudes, type SphericalAngles } from '@/lib/bloch';
import { formatComplex } from '@/lib/format';
import { ket, type Notation } from '@/lib/notation';
import { cn } from '@/lib/utils';

interface DiracFormulaProps {
  state: SphericalAngles;
  notation: Notation;
  /** Tamaño y espaciado los pone quien la usa: el panel de estado la quiere grande, el curso pequeña. */
  className?: string;
  'aria-live'?: 'polite' | 'off';
}

/** |ψ⟩ = α|0⟩ + (β)|1⟩ con la convención de fase global (α real ≥ 0; en los polos φ = 0). */
export function DiracFormula({ state, notation, className, 'aria-live': ariaLive }: DiracFormulaProps) {
  const { alpha, beta } = amplitudes(state);
  return (
    <div className={cn('math-formula text-center', className)} aria-live={ariaLive}>
      |ψ⟩ = {formatComplex(alpha)}
      {ket('zero', notation)} + ({formatComplex(beta)}){ket('one', notation)}
    </div>
  );
}
