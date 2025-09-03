import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface StateDisplayProps {
  theta: number;
  phi: number;
}

export function StateDisplay({ theta, phi }: StateDisplayProps) {
  // Calculate Cartesian coordinates (Z vertical convention)
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);

  // Calculate complex amplitudes
  const alpha = Math.cos(theta / 2);
  const betaReal = Math.sin(theta / 2) * Math.cos(phi);
  const betaImag = Math.sin(theta / 2) * Math.sin(phi);

  // Calculate probabilities
  const prob0 = Math.pow(Math.cos(theta / 2), 2);
  const prob1 = Math.pow(Math.sin(theta / 2), 2);

  // Format complex number for display
  const formatComplex = (real: number, imag: number): string => {
    if (Math.abs(imag) < 0.001) return real.toFixed(3);
    if (Math.abs(real) < 0.001) return `${imag.toFixed(3)}i`;
    const sign = imag >= 0 ? '+' : '-';
    return `${real.toFixed(3)} ${sign} ${Math.abs(imag).toFixed(3)}i`;
  };


  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-primary">Estado cuántico actual</h3>

      {/* Quantum State */}
      <div>
        <h4 className="text-sm font-medium mb-2">Notación de Dirac</h4>
        <div className="math-formula text-center py-2">
          |ψ⟩ = {alpha.toFixed(3)}|0⟩ + ({formatComplex(betaReal, betaImag)})|1⟩
        </div>
      </div>

      <Separator />

      {/* Coordinates */}

      <h4 className="text-sm font-medium mb-2">Coordenadas </h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Esféricas</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">θ (theta):</span>
              <Badge variant="outline">{(theta * 180 / Math.PI).toFixed(1)}°</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">φ (phi):</span>
              <Badge variant="outline">{(phi * 180 / Math.PI).toFixed(1)}°</Badge>
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

      {/* Probabilities */}
      <div>
        <h4 className="text-sm font-medium mb-2">Probabilidades de medición</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">P(|0⟩) = |α|²:</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-quantum-blue transition-all duration-300"
                  style={{ width: `${prob0 * 100}%` }}
                />
              </div>
              <Badge variant="outline">{(prob0 * 100).toFixed(1)}%</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">P(|1⟩) = |β|²:</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-quantum-purple transition-all duration-300"
                  style={{ width: `${prob1 * 100}%` }}
                />
              </div>
              <Badge variant="outline">{(prob1 * 100).toFixed(1)}%</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Information */}
      <div>
        <h4 className="text-sm font-medium mb-2">Información de Fase</h4>
        <div className="math-formula text-center py-2">
          Fase relativa: e^(iφ) = {formatComplex(Math.cos(phi), Math.sin(phi))}
        </div>
      </div>
    </Card>
  );
}