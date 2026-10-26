import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
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
import { AXIS_COLORS } from '@/lib/colors';

interface StateDisplayProps {
  theta: number;
  phi: number;
  notation: Notation;
  mode: ViewMode;
  /** Sliders de θ/φ (o de α en modo círculo): el estado se edita junto a sus coordenadas. */
  onRotationChange: (angle: 'theta' | 'phi' | 'alpha', value: number) => void;
}

const degrees = (radians: number) => ((radians * 180) / Math.PI).toFixed(1);
const percent = (p: number) => `${(p * 100).toFixed(1)}%`;
const toDegrees = (radians: number) => Math.round((radians * 180) / Math.PI);
const toRadians = (deg: number) => (deg * Math.PI) / 180;

/** Autoestado "+" de cada eje, en convención física. */
const AXES: Record<'z' | 'x' | 'y', BlochVector> = {
  z: { x: 0, y: 0, z: 1 },
  x: { x: 1, y: 0, z: 0 },
  y: { x: 0, y: 1, z: 0 },
};

/** Un ángulo editable: etiqueta, valor y slider en grados enteros (90°, 180° exactos). */
function AngleSlider({
  name,
  label,
  shown,
  value,
  min,
  max,
  title,
  onChange,
}: {
  /** Nombre accesible del grupo (texto plano). */
  name: string;
  label: React.ReactNode;
  /** Texto del Badge; difiere del valor cuando el ángulo no está definido (φ en los polos). */
  shown: string;
  value: number;
  min: number;
  max: number;
  title?: string;
  onChange: (degrees: number) => void;
}) {
  // El nombre accesible va en el grupo: el Slider de shadcn no pasa aria-label al pulgar
  return (
    <div role="group" aria-label={name}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm">{label}</span>
        <Badge variant="outline" className="text-xs font-mono tabular-nums" title={title}>
          {shown}
        </Badge>
      </div>
      <Slider value={[value]} onValueChange={(v) => onChange(v[0])} min={min} max={max} step={1} className="w-full" />
    </div>
  );
}

/** Barra vertical de una probabilidad; el valor y el ket van en texto, el color solo identifica la base. */
function ProbabilityColumn({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] font-mono tabular-nums">{percent(value)}</span>
      <div
        className="h-14 w-6 rounded-sm bg-muted overflow-hidden flex items-end"
        role="img"
        aria-label={`P(${label}) = ${percent(value)}`}
      >
        <div
          className="w-full rounded-t transition-all duration-300"
          style={{ height: `${value * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] font-mono text-muted-foreground">{label}</span>
    </div>
  );
}

function BasisBlock({
  title,
  axis,
  probabilities,
  plusLabel,
  minusLabel,
  angle,
}: {
  title: string;
  /** Eje de la base; fija el color, el mismo que en la esfera y en las compuertas. */
  axis: 'z' | 'x' | 'y';
  probabilities: BasisProbabilities;
  plusLabel: string;
  minusLabel: string;
  /** Ángulo θ_B entre la flecha y el autoestado "+" del eje: P(+) = cos²(θ_B/2). */
  angle: number;
}) {
  const color = AXIS_COLORS[axis];
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
          <span className="text-xs font-medium text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground">eje {axis.toUpperCase()}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Ángulo con {plusLabel}: {degrees(angle)}° → cos²({degrees(angle / 2)}°) = {percent(probabilities.plus)}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <ProbabilityColumn label={plusLabel} value={probabilities.plus} color={color} />
        <ProbabilityColumn label={minusLabel} value={probabilities.minus} color={color} />
      </div>
    </div>
  );
}

export function StateDisplay({ theta, phi, notation, mode, onRotationChange }: StateDisplayProps) {
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

  // Modo círculo: la fórmula cos(α/2)|0⟩ + sin(α/2)|1⟩ da las amplitudes con el
  // signo opuesto cuando α > 180° (fase global −1: el mismo estado).
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
        <div className="math-formula text-center text-base lg:text-lg py-3">
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

      {/* Coordenadas: se leen y se editan en el mismo sitio */}
      <div className="space-y-4">
        <h4 className={SECTION_LABEL}>Coordenadas</h4>

        <div className="space-y-3">
          <h5 className="text-sm font-medium">{isCircle ? 'Ángulo en el círculo' : 'Esféricas'}</h5>
          {isCircle ? (
            <>
              <AngleSlider
                name="α, ángulo en el círculo"
                label={
                  <>
                    α (desde <span className="font-mono">{k0}</span>)
                  </>
                }
                shown={`${toDegrees(circleAlpha)}°`}
                value={toDegrees(circleAlpha)}
                min={0}
                max={359}
                onChange={(deg) => onRotationChange('alpha', toRadians(deg))}
              />
              <div className="math-formula text-center">
                |ψ⟩ = cos(α/2){k0} + sin(α/2){k1}
              </div>
              <p className="text-xs text-muted-foreground">
                En el círculo las dos amplitudes son reales: un solo ángulo basta. α = 90° es {ket('plus', notation)} y
                α = 270° es {ket('minus', notation)}. Equivale a θ = {degrees(theta)}°, φ ={' '}
                {atPole ? 'indefinida' : `${degrees(phi)}°`}.
              </p>
            </>
          ) : (
            <>
              <AngleSlider
                name="θ (polar)"
                label="θ (polar)"
                shown={`${degrees(theta)}°`}
                value={toDegrees(theta)}
                min={0}
                max={180}
                onChange={(deg) => onRotationChange('theta', toRadians(deg))}
              />
              <AngleSlider
                name="φ (azimut)"
                label="φ (azimut)"
                shown={atPole ? 'indefinida' : `${degrees(phi)}°`}
                title={atPole ? 'En los polos cualquier φ describe el mismo estado' : undefined}
                value={toDegrees(phi)}
                min={-180}
                max={180}
                onChange={(deg) => onRotationChange('phi', toRadians(deg))}
              />
            </>
          )}
        </div>

        <div className="space-y-2">
          <h5 className="text-sm font-medium">Cartesianas</h5>
          <div className="grid grid-cols-3 gap-2 text-center">
            {(
              [
                ['x', x],
                ['y', y],
                ['z', z],
              ] as const
            ).map(([axis, value]) => (
              <div key={axis} className="rounded-md border bg-card/50 py-1.5">
                <div className="text-[11px] text-muted-foreground">{axis}</div>
                <div className="font-mono tabular-nums text-lg leading-tight">{value.toFixed(3)}</div>
              </div>
            ))}
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
            axis="z"
            probabilities={probabilities.z}
            plusLabel={k0}
            minusLabel={k1}
            angle={angleBetween(v, AXES.z)}
          />
          <BasisBlock
            title="Base X"
            axis="x"
            probabilities={probabilities.x}
            plusLabel={ket('plus', notation)}
            minusLabel={ket('minus', notation)}
            angle={angleBetween(v, AXES.x)}
          />
          <BasisBlock
            title="Base Y"
            axis="y"
            probabilities={probabilities.y}
            plusLabel={ket('plusI', notation)}
            minusLabel={ket('minusI', notation)}
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
