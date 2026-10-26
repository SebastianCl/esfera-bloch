import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { measurementProbabilities, toBlochVector, type BasisProbabilities } from '@/lib/bloch';
import { ket, type Notation } from '@/lib/notation';

interface StateDisplayProps {
  theta: number;
  phi: number;
  notation: Notation;
}

// Format complex number for display
const formatComplex = (real: number, imag: number): string => {
  if (Math.abs(imag) < 0.001) return real.toFixed(3);
  if (Math.abs(real) < 0.001) return `${imag.toFixed(3)}i`;
  const sign = imag >= 0 ? '+' : '-';
  return `${real.toFixed(3)} ${sign} ${Math.abs(imag).toFixed(3)}i`;
};

const degrees = (radians: number) => ((radians * 180) / Math.PI).toFixed(1);

function ProbabilityBar({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground font-mono">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
          <div className={`h-full ${colorClass} transition-all duration-300`} style={{ width: `${value * 100}%` }} />
        </div>
        <Badge variant="outline" className="w-16 justify-center">
          {(value * 100).toFixed(1)}%
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
}: {
  title: string;
  axis: string;
  probabilities: BasisProbabilities;
  plusLabel: string;
  minusLabel: string;
  colorClass: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">eje {axis}</span>
      </div>
      <ProbabilityBar label={`P(${plusLabel})`} value={probabilities.plus} colorClass={colorClass} />
      <ProbabilityBar label={`P(${minusLabel})`} value={probabilities.minus} colorClass={colorClass} />
    </div>
  );
}

export function StateDisplay({ theta, phi, notation }: StateDisplayProps) {
  // Vector de Bloch en convención física (Z vertical)
  const { x, y, z } = toBlochVector(theta, phi);

  // Amplitudes complejas: |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩
  const alpha = Math.cos(theta / 2);
  const betaReal = Math.sin(theta / 2) * Math.cos(phi);
  const betaImag = Math.sin(theta / 2) * Math.sin(phi);

  const probabilities = measurementProbabilities({ x, y, z });

  const k0 = ket('zero', notation);
  const k1 = ket('one', notation);

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-primary">Estado cuántico actual</h3>

      {/* Quantum State */}
      <div>
        <h4 className="text-sm font-medium mb-2">Notación de Dirac</h4>
        <div className="math-formula text-center py-2">
          |ψ⟩ = {alpha.toFixed(3)}
          {k0} + ({formatComplex(betaReal, betaImag)}){k1}
        </div>
        <div className="math-formula text-center py-2 mt-2 text-xs">
          = cos({degrees(theta / 2)}°){k0} + e^(i·{degrees(phi)}°) sin({degrees(theta / 2)}°){k1}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Norma 1: |α|² + |β|² = {(alpha ** 2 + betaReal ** 2 + betaImag ** 2).toFixed(3)}
        </p>
      </div>

      <Separator />

      {/* Coordinates */}
      <h4 className="text-sm font-medium mb-2">Coordenadas</h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Esféricas</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">θ (theta):</span>
              <Badge variant="outline">{degrees(theta)}°</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">φ (phi):</span>
              <Badge variant="outline">{degrees(phi)}°</Badge>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Cartesianas</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">x:</span>
              <Badge variant="outline">{x.toFixed(3)}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">y:</span>
              <Badge variant="outline">{y.toFixed(3)}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">z:</span>
              <Badge variant="outline">{z.toFixed(3)}</Badge>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Probabilities in the three bases */}
      <div>
        <h4 className="text-sm font-medium mb-1">Probabilidades de medición</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Regla de Born en cada eje: P(+) = (1 + componente)/2. La fase φ no cambia la medición en Z, pero sí en X e Y.
        </p>
        <div className="space-y-3">
          <BasisBlock
            title="Base Z (computacional)"
            axis="Z"
            probabilities={probabilities.z}
            plusLabel={k0}
            minusLabel={k1}
            colorClass="bg-quantum-blue"
          />
          <BasisBlock
            title="Base X"
            axis="X"
            probabilities={probabilities.x}
            plusLabel={ket('plus', notation)}
            minusLabel={ket('minus', notation)}
            colorClass="bg-red-500"
          />
          <BasisBlock
            title="Base Y"
            axis="Y"
            probabilities={probabilities.y}
            plusLabel={ket('plusI', notation)}
            minusLabel={ket('minusI', notation)}
            colorClass="bg-emerald-500"
          />
        </div>
      </div>

      <Separator />

      {/* Phase Information */}
      <div>
        <h4 className="text-sm font-medium mb-2">Fase relativa</h4>
        <div className="math-formula text-center py-2">e^(iφ) = {formatComplex(Math.cos(phi), Math.sin(phi))}</div>
        <p className="text-xs text-muted-foreground mt-2">
          Es el número complejo de módulo 1 que multiplica a {k1}. Visto desde el polo, es la posición del estado en el
          plano complejo.
        </p>
      </div>
    </Card>
  );
}
