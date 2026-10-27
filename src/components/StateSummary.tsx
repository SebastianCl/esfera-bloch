import { Badge } from '@/components/ui/badge';
import { CircleFormula } from '@/components/CircleFormula';
import { DiracFormula } from '@/components/DiracFormula';
import {
  circleAngleFromState,
  isPole,
  ketKeyOf,
  measurementProbabilities,
  toBlochVector,
  type KetKey,
  type SphericalAngles,
} from '@/lib/bloch';
import { AXIS_COLORS } from '@/lib/colors';
import type { ViewMode } from '@/lib/modes';
import { ket, type Notation } from '@/lib/notation';

interface StateSummaryProps {
  state: SphericalAngles;
  mode: ViewMode;
  notation: Notation;
  /** Aviso en línea (el curso no usa toasts): «el estado salió del círculo…». */
  notice?: string | null;
  /** Solo la línea de Dirac y el nombre del autoestado (dock reducido en móvil). */
  compact?: boolean;
}

const degrees = (radians: number) => ((radians * 180) / Math.PI).toFixed(1);
const percent = (p: number) => `${(p * 100).toFixed(1)} %`;

const BASES: { axis: 'z' | 'x' | 'y'; plus: KetKey; minus: KetKey }[] = [
  { axis: 'z', plus: 'zero', minus: 'one' },
  { axis: 'x', plus: 'plus', minus: 'minus' },
  { axis: 'y', plus: 'plusI', minus: 'minusI' },
];

/**
 * Lectura del estado bajo la esfera del curso: la fórmula de Dirac (anunciada
 * a los lectores de pantalla), el autoestado si lo es, θ, φ y r, en modo
 * círculo α y su fórmula, y las probabilidades en las tres bases con sus kets.
 * Es el instrumento con el que el alumno comprueba cada ejercicio.
 */
export function StateSummary({ state, mode, notation, notice, compact = false }: StateSummaryProps) {
  const v = toBlochVector(state.theta, state.phi);
  const key = ketKeyOf(state);
  const atPole = isPole(state.theta);
  const probabilities = measurementProbabilities(v);
  const isCircle = mode === 'circulo';

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <DiracFormula state={state} notation={notation} className="text-sm" aria-live="polite" />
        {key && (
          <Badge variant="outline" className="font-mono">
            {ket(key, notation)}
          </Badge>
        )}
      </div>

      {!compact && (
        <>
          <p className="text-xs text-muted-foreground text-center">
            θ = <span className="font-mono tabular-nums">{degrees(state.theta)}°</span> · φ ={' '}
            <span className="font-mono tabular-nums">{atPole ? 'indef.' : `${degrees(state.phi)}°`}</span> · r = (
            <span className="font-mono tabular-nums">
              {v.x.toFixed(3)}, {v.y.toFixed(3)}, {v.z.toFixed(3)}
            </span>
            )
          </p>

          {isCircle && (
            <div className="text-xs text-muted-foreground text-center">
              α = <span className="font-mono tabular-nums">{Math.round((circleAngleFromState(state) * 180) / Math.PI)}°</span>
              <CircleFormula state={state} notation={notation} />
            </div>
          )}

          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-foreground">
            {BASES.map(({ axis, plus, minus }) => (
              <li key={axis} className="flex items-center gap-1.5">
                <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: AXIS_COLORS[axis] }} />
                <span className="text-muted-foreground">{axis.toUpperCase()}</span>
                <span className="font-mono">{ket(plus, notation)}</span>
                <span className="font-mono tabular-nums">{percent(probabilities[axis].plus)}</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-mono">{ket(minus, notation)}</span>
                <span className="font-mono tabular-nums">{percent(probabilities[axis].minus)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <p role="status" className="text-xs text-muted-foreground text-center min-h-[1rem]">
        {notice ?? ''}
      </p>
    </div>
  );
}
