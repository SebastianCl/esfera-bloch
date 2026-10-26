import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { circleAngleFromState, GATE_ROTATIONS, type KetKey } from '@/lib/bloch';
import { ket, KET_KEYS, type Notation } from '@/lib/notation';
import type { ViewMode } from '@/lib/modes';

interface QuantumControlsProps {
  onGateClick: (gate: string) => void;
  onPresetClick: (preset: KetKey | 'random') => void;
  onReset: () => void;
  theta: number;
  phi: number;
  /** 'alpha' es el ángulo sobre el círculo de Bloch (modo círculo). */
  onRotationChange: (angle: 'theta' | 'phi' | 'alpha', value: number) => void;
  notation: Notation;
  mode: ViewMode;
  /** Compuertas aplicadas desde el último estado fijado a mano, en orden. */
  history: string[];
  onUndo: () => void;
  onClearHistory: () => void;
}

const toDegrees = (radians: number) => Math.round((radians * 180) / Math.PI);
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const gates = [
  { name: 'X', description: 'Pauli-X (inversión de bit)', color: 'bg-red-500' },
  { name: 'Y', description: 'Pauli-Y (inversión de bit y de fase)', color: 'bg-green-500' },
  { name: 'Z', description: 'Pauli-Z (inversión de fase)', color: 'bg-blue-500' },
  { name: 'H', description: 'Hadamard', color: 'bg-purple-500' },
  { name: 'S', description: 'Fase π/2', color: 'bg-cyan-500' },
  { name: 'T', description: 'Fase π/4', color: 'bg-amber-500' },
];

export function QuantumControls({
  onGateClick,
  onPresetClick,
  onReset,
  theta,
  phi,
  onRotationChange,
  notation,
  mode,
  history,
  onUndo,
  onClearHistory,
}: QuantumControlsProps) {
  const isCircle = mode === 'circulo';
  const alpha = circleAngleFromState({ theta, phi });

  return (
    <div className="space-y-6">
      {/* Quantum Gates */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3 text-primary">Compuertas cuánticas</h3>
        {/* Tres columnas cuando la tarjeta va a todo el ancho; dos en la columna estrecha de lg */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
          {gates.map((gate) => {
            const rotation = GATE_ROTATIONS[gate.name];
            return (
              <Tooltip key={gate.name}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="quantum-glow transition-all duration-300 hover:scale-105"
                    onClick={() => onGateClick(gate.name)}
                    aria-label={`${gate.name}: ${gate.description}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${gate.color}`} />
                      <span className="font-mono font-bold">{gate.name}</span>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-56">
                  <p className="font-medium">{gate.description}</p>
                  <p className="text-muted-foreground">
                    Rotación de <span className="font-mono tabular-nums">{toDegrees(rotation.angle)}°</span> alrededor
                    del {rotation.axisLabel}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Cada compuerta es una rotación de la esfera: su eje y ángulo aparecen al pasar el cursor y en el aviso al
          aplicarla.
        </div>
      </Card>

      {/* Circuit history */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3 text-primary">Circuito aplicado</h3>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aplica una compuerta para empezar el circuito.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-1 font-mono text-sm">
            {history.map((gate, index) => (
              <span key={`${gate}-${index}`} className="flex items-center gap-1">
                {index > 0 && <span className="text-muted-foreground">→</span>}
                <Badge variant="secondary">{gate}</Badge>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="flex-1" onClick={onUndo} disabled={history.length === 0}>
            Deshacer última
          </Button>
          <Button variant="ghost" size="sm" className="flex-1" onClick={onClearHistory} disabled={history.length === 0}>
            Vaciar
          </Button>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">Mover el estado a mano empieza un circuito nuevo.</div>
      </Card>

      {/* Rotation Controls */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3 text-primary">
          {isCircle ? 'Ángulo en el círculo' : 'Ángulos esféricos'}
        </h3>

        {isCircle ? (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">
                  α (desde <span className="font-mono">{ket('zero', notation)}</span>)
                </span>
                <Badge variant="outline" className="text-xs font-mono tabular-nums">
                  {toDegrees(alpha)}°
                </Badge>
              </div>
              <Slider
                value={[toDegrees(alpha)]}
                onValueChange={(value) => onRotationChange('alpha', toRadians(value[0]))}
                max={359}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <div className="math-formula text-center">
              |ψ⟩ = cos(α/2){ket('zero', notation)} + sin(α/2){ket('one', notation)}
            </div>
            <p className="text-xs text-muted-foreground">
              En el círculo las dos amplitudes son reales: un solo ángulo basta. α = 90° es {ket('plus', notation)} y α =
              270° es {ket('minus', notation)}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">θ (polar)</span>
                <Badge variant="outline" className="text-xs font-mono tabular-nums">
                  {((theta * 180) / Math.PI).toFixed(1)}°
                </Badge>
              </div>
              {/* El slider trabaja en grados enteros para que los valores sean exactos (90°, 180°) */}
              <Slider
                value={[toDegrees(theta)]}
                onValueChange={(value) => onRotationChange('theta', toRadians(value[0]))}
                max={180}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">φ (azimut)</span>
                <Badge variant="outline" className="text-xs font-mono tabular-nums">
                  {((phi * 180) / Math.PI).toFixed(1)}°
                </Badge>
              </div>
              <Slider
                value={[toDegrees(phi)]}
                onValueChange={(value) => onRotationChange('phi', toRadians(value[0]))}
                max={180}
                min={-180}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Preset States */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3 text-primary">Estados predefinidos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
          {KET_KEYS.map((key) => {
            const leavesCircle = isCircle && (key === 'plusI' || key === 'minusI');
            return (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className={`quantum-glow ${leavesCircle ? 'border-dashed opacity-70' : ''}`}
                onClick={() => onPresetClick(key)}
                title={leavesCircle ? 'Este estado tiene fase imaginaria: no cabe en el círculo' : undefined}
              >
                <span className="font-mono">{ket(key, notation)}</span>
              </Button>
            );
          })}
        </div>
        {isCircle && (
          <p className="mt-2 text-xs text-muted-foreground">
            {ket('plusI', notation)} y {ket('minusI', notation)} están fuera del plano: elegirlos abre la esfera completa.
          </p>
        )}
      </Card>

      <Separator />

      {/* Control Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onReset} className="flex-1">
          Reiniciar
        </Button>
        <Button variant="outline" onClick={() => onPresetClick('random')} className="flex-1">
          Aleatorio
        </Button>
      </div>
    </div>
  );
}
