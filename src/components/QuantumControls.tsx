import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface QuantumControlsProps {
  onGateClick: (gate: string) => void;
  onPresetClick: (preset: string) => void;
  onReset: () => void;
  theta: number;
  phi: number;
  onRotationChange: (axis: string, value: number) => void;
}

const gates = [
  { name: 'X', description: 'Pauli-X (Bit flip)', color: 'bg-red-500' },
  { name: 'Y', description: 'Pauli-Y', color: 'bg-green-500' },
  { name: 'Z', description: 'Pauli-Z (Phase flip)', color: 'bg-blue-500' },
  { name: 'H', description: 'Hadamard', color: 'bg-purple-500' },
  { name: 'S', description: 'Phase gate', color: 'bg-cyan-500' },
  { name: 'T', description: 'π/8 gate', color: 'bg-amber-500' },
];

const presets = [
  { name: '|0⟩', theta: 0, phi: 0, description: 'Ground state' },
  { name: '|1⟩', theta: Math.PI, phi: 0, description: 'Excited state' },
  { name: '|+⟩', theta: Math.PI / 2, phi: 0, description: 'Plus state' },
  { name: '|-⟩', theta: Math.PI / 2, phi: Math.PI, description: 'Minus state' },
  { name: '|+i⟩', theta: Math.PI / 2, phi: Math.PI / 2, description: 'Plus i state' },
  { name: '|-i⟩', theta: Math.PI / 2, phi: -Math.PI / 2, description: 'Minus i state' },
];

export function QuantumControls({
  onGateClick,
  onPresetClick,
  onReset,
  theta,
  phi,
  onRotationChange
}: QuantumControlsProps) {
  return (
    <div className="space-y-6">
      {/* Quantum Gates */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3 text-primary">Compuertas cuánticas</h3>
        <div className="grid grid-cols-2 gap-2">
          {gates.map((gate) => (
            <Button
              key={gate.name}
              variant="outline"
              className="quantum-glow transition-all duration-300 hover:scale-105"
              onClick={() => onGateClick(gate.name)}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${gate.color}`} />
                <span className="font-mono font-bold">{gate.name}</span>
              </div>
            </Button>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Haz clic en una compuerta para aplicarla al estado cuántico
        </div>
      </Card>

      {/* Rotation Controls */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3 text-primary">Rotaciones parametrizadas</h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono">θ (polar)</span>
              <Badge variant="outline" className="text-xs">
                {(theta * 180 / Math.PI).toFixed(1)}°
              </Badge>
            </div>
            <Slider
              value={[theta]}
              onValueChange={(value) => onRotationChange('x', value[0])}
              max={2 * Math.PI}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono">φ (azimut)</span>
              <Badge variant="outline" className="text-xs">
                {(phi * 180 / Math.PI).toFixed(1)}°
              </Badge>
            </div>
            <Slider
              value={[phi]}
              onValueChange={(value) => onRotationChange('y', value[0])}
              max={2 * Math.PI}
              min={-Math.PI}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Preset States */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3 text-primary">Estados predefinidos</h3>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              className="quantum-glow"
              onClick={() => onPresetClick(preset.name)}
            >
              <span className="font-mono">{preset.name}</span>
            </Button>
          ))}
        </div>
      </Card>

      <Separator />

      {/* Control Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex-1"
        >
          Reiniciar
        </Button>
        <Button
          variant="outline"
          onClick={() => onPresetClick('random')}
          className="flex-1"
        >
          Aleatorio
        </Button>
      </div>
    </div>
  );
}