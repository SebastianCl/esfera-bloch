import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MatrixView } from '@/components/MatrixView';
import {
  amplitudes,
  angleBetween,
  circleAngleFromState,
  densityMatrix,
  isPole,
  measurementProbabilities,
  purity,
  toBlochVector,
  type BasisProbabilities,
  type BlochVector,
} from '@/lib/bloch';
import { cabs2 } from '@/lib/complex';
import { formatComplex } from '@/lib/format';
import { ket, type Notation } from '@/lib/notation';
import type { ViewMode } from '@/lib/modes';
import { PANEL_TITLE, SECTION_LABEL } from '@/lib/styles';

interface StateDisplayProps {
  theta: number;
  phi: number;
  notation: Notation;
  mode: ViewMode;
}

const degrees = (radians: number) => ((radians * 180) / Math.PI).toFixed(1);
const percent = (p: number) => `${(p * 100).toFixed(1)}%`;

/** Autoestado "+" de cada eje, en convención física. */
const AXES: Record<'z' | 'x' | 'y', BlochVector> = {
  z: { x: 0, y: 0, z: 1 },
  x: { x: 1, y: 0, z: 0 },
  y: { x: 0, y: 1, z: 0 },
};

function ProbabilityBar({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground font-mono">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
          <div className={`h-full ${colorClass} transition-all duration-300`} style={{ width: `${value * 100}%` }} />
        </div>
        <Badge variant="outline" className="w-16 justify-center font-mono tabular-nums">
          {percent(value)}
        </Badge>
      </div>
    </div>
  );
}

function BasisBlock({
  title,
  axis,
  probabilities,
  plusLabel,
  minusLabel,
  colorClass,
  angle,
}: {
  title: string;
  axis: string;
  probabilities: BasisProbabilities;
  plusLabel: string;
  minusLabel: string;
  colorClass: string;
  /** Ángulo θ_B entre la flecha y el autoestado "+" del eje: P(+) = cos²(θ_B/2). */
  angle: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">eje {axis}</span>
      </div>
      <ProbabilityBar label={`P(${plusLabel})`} value={probabilities.plus} colorClass={colorClass} />
      <ProbabilityBar label={`P(${minusLabel})`} value={probabilities.minus} colorClass={colorClass} />
      <p className="text-[11px] text-muted-foreground">
        Ángulo con {plusLabel}: {degrees(angle)}° → cos²({degrees(angle / 2)}°) = {percent(probabilities.plus)}
      </p>
    </div>
  );
}

export function StateDisplay({ theta, phi, notation, mode }: StateDisplayProps) {
  // Vector de Bloch en convención física (Z vertical)
  const v = toBlochVector(theta, phi);
  const { x, y, z } = v;

  // Amplitudes con la convención de fase global: α real ≥ 0 (y φ = 0 en los polos)
  const { alpha, beta } = amplitudes({ theta, phi });
  const norm = cabs2(alpha) + cabs2(beta);
  const atPole = isPole(theta);
  const shownPhi = atPole ? 0 : phi;

  const probabilities = measurementProbabilities(v);
  const rho = densityMatrix(v);

  // Modo círculo: la fórmula de los controles, cos(α/2)|0⟩ + sin(α/2)|1⟩, da las
  // amplitudes con el signo opuesto cuando α > 180° (fase global −1: el mismo estado).
  const isCircle = mode === 'circulo';
  const circleAlpha = circleAngleFromState({ theta, phi });
  const circleFlipsSign = isCircle && circleAlpha > Math.PI + 1e-9;

  const k0 = ket('zero', notation);
  const k1 = ket('one', notation);

  // Sin Card propia: la tarjeta la pone Index.tsx, y un marco dentro de otro solo resta ancho en móvil
  return (
    <div className="space-y-4">
      <h3 className={PANEL_TITLE}>Estado cuántico</h3>

      {/* Notación de Dirac */}
      <div>
        <h4 className={`${SECTION_LABEL} mb-2`}>Notación de Dirac</h4>
        <div className="math-formula text-center py-2">
          |ψ⟩ = {formatComplex(alpha)}
          {k0} + ({formatComplex(beta)}){k1}
        </div>
        <div className="math-formula text-center py-2 mt-2 text-xs">
          = cos({degrees(theta / 2)}°){k0} + e^(i·{degrees(shownPhi)}°) sin({degrees(theta / 2)}°){k1}
        </div>
        {isCircle && (
          <div className="math-formula text-center py-2 mt-2 text-xs">
            Círculo: cos(α/2){k0} + sin(α/2){k1} = {formatComplex({ re: Math.cos(circleAlpha / 2), im: 0 })}
            {k0} + ({formatComplex({ re: Math.sin(circleAlpha / 2), im: 0 })}){k1}
          </div>
        )}
        {circleFlipsSign && (
          <p className="text-xs text-muted-foreground mt-2">
            Con α &gt; 180° la fórmula del círculo da las amplitudes con el signo opuesto a las de arriba. Ese −1
            multiplica a todo el estado: es una fase global, no se puede medir y describe el mismo punto de la esfera.
            No es el signo entre {k0} y {k1} (φ = 180°), que es una fase relativa y sí distingue{' '}
            {ket('minus', notation)} de {ket('plus', notation)}.
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Norma 1: |α|² + |β|² = {norm.toFixed(3)}. Convención: α real y ≥ 0 (y si α = 0, β = 1), porque la fase
          global e^(iγ) no es observable; por eso bastan dos ángulos, θ y φ.
        </p>
      </div>

      <Separator />

      {/* Coordenadas */}
      <h4 className={`${SECTION_LABEL} mb-2`}>Coordenadas</h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h5 className="text-sm font-medium mb-2">Esféricas</h5>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">θ (theta):</span>
              <Badge variant="outline" className="font-mono tabular-nums">
                {degrees(theta)}°
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">φ (phi):</span>
              <Badge
                variant="outline"
                className="font-mono tabular-nums"
                title={atPole ? 'En los polos sin θ = 0: cualquier φ describe el mismo estado' : undefined}
              >
                {atPole ? 'indefinida' : `${degrees(phi)}°`}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium mb-2">Cartesianas</h5>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">x:</span>
              <Badge variant="outline" className="font-mono tabular-nums">
                {x.toFixed(3)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">y:</span>
              <Badge variant="outline" className="font-mono tabular-nums">
                {y.toFixed(3)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">z:</span>
              <Badge variant="outline" className="font-mono tabular-nums">
                {z.toFixed(3)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Probabilidades en las tres bases */}
      <div>
        <h4 className={`${SECTION_LABEL} mb-1`}>Probabilidades de medición</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Regla de Born en cada eje: P(+) = (1 + r·n̂)/2 = cos²(θ_B/2), con θ_B el ángulo entre la flecha y el
          autoestado. Ortogonal significa antípoda (180°), no 90°: a 90° la probabilidad es 50 %. La fase φ no cambia
          la medición en Z, pero sí en X e Y.
        </p>
        <div className="space-y-3">
          <BasisBlock
            title="Base Z (computacional)"
            axis="Z"
            probabilities={probabilities.z}
            plusLabel={k0}
            minusLabel={k1}
            colorClass="bg-quantum-blue"
            angle={angleBetween(v, AXES.z)}
          />
          <BasisBlock
            title="Base X"
            axis="X"
            probabilities={probabilities.x}
            plusLabel={ket('plus', notation)}
            minusLabel={ket('minus', notation)}
            colorClass="bg-red-500"
            angle={angleBetween(v, AXES.x)}
          />
          <BasisBlock
            title="Base Y"
            axis="Y"
            probabilities={probabilities.y}
            plusLabel={ket('plusI', notation)}
            minusLabel={ket('minusI', notation)}
            colorClass="bg-emerald-500"
            angle={angleBetween(v, AXES.y)}
          />
        </div>
      </div>

      <Separator />

      {/* Fase relativa */}
      <div>
        <h4 className={`${SECTION_LABEL} mb-2`}>Fase relativa</h4>
        <div className="math-formula text-center py-2">
          e^(iφ) = {atPole ? 'indefinida' : formatComplex({ re: Math.cos(phi), im: Math.sin(phi) })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {atPole
            ? `En los polos una de las dos amplitudes es cero, así que la fase que multiplica a ${k1} no es relativa a nada: sería una fase global y no está definida.`
            : `Es el número complejo de módulo 1 que multiplica a ${k1}. Visto desde el polo, es la posición del estado en el plano complejo.`}
        </p>
      </div>

      <Separator />

      {/* Matriz de densidad */}
      <div>
        <h4 className={`${SECTION_LABEL} mb-1`}>Matriz de densidad</h4>
        <p className="text-xs text-muted-foreground mb-2 font-mono">ρ = |ψ⟩⟨ψ| = ½(I + r·σ)</p>
        <div className="flex justify-center overflow-x-auto py-1">
          <MatrixView matrix={rho} format={formatComplex} className="text-[11px] leading-tight" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Diagonal: P({k0}) y P({k1}). Fuera de la diagonal, las coherencias (x ∓ iy)/2, que dependen de la fase. Tr ρ
          = 1 y Tr ρ² = {purity(v).toFixed(3)}: estado puro, |r| = 1, sobre la superficie. Un estado mixto tendría |r|
          &lt; 1 y quedaría dentro de la esfera.
        </p>
      </div>
    </div>
  );
}
