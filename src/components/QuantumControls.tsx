import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';
import { Trash2, Undo2 } from 'lucide-react';
import { GateIcon } from '@/components/GateIcon';
import { GATE_ROTATIONS, ketKeyOf, type KetKey, type SphericalAngles } from '@/lib/bloch';
import { axisColor } from '@/lib/colors';
import { ket, KET_KEYS, type Notation } from '@/lib/notation';
import type { ViewMode } from '@/lib/modes';
import { SECTION_LABEL } from '@/lib/styles';

interface QuantumControlsProps {
  onGateClick: (gate: string) => void;
  onPresetClick: (preset: KetKey | 'random') => void;
  onReset: () => void;
  notation: Notation;
  /** Solo para avisar de los presets que sacan del círculo; los sliders viven en StateDisplay. */
  mode: ViewMode;
  /** Compuertas aplicadas desde el último estado fijado a mano, en orden. */
  history: string[];
  /** Estado del que partió el circuito (antes de la primera compuerta). */
  initialState?: SphericalAngles;
  onUndo: () => void;
  onClearHistory: () => void;
}

const toDegrees = (radians: number) => Math.round((radians * 180) / Math.PI);

/** Nombre del estado inicial del circuito: su ket si es un autoestado, si no sus ángulos. */
const describeInitial = (state: SphericalAngles, notation: Notation): string => {
  const key = ketKeyOf(state);
  return key ? ket(key, notation) : `(θ ${toDegrees(state.theta)}°, φ ${toDegrees(state.phi)}°)`;
};

/** Compuertas por grupo. El eje, el ángulo y el color salen de GATE_ROTATIONS y colors.ts. */
const GATE_GROUPS: { label: string; gates: { name: string; description: string }[] }[] = [
  {
    label: 'Pauli',
    gates: [
      { name: 'X', description: 'Pauli-X (inversión de bit)' },
      { name: 'Y', description: 'Pauli-Y (inversión de bit y de fase)' },
      { name: 'Z', description: 'Pauli-Z (inversión de fase)' },
    ],
  },
  {
    label: 'Superposición y fase',
    gates: [
      { name: 'H', description: 'Hadamard' },
      { name: 'S', description: 'Fase π/2' },
      { name: 'T', description: 'Fase π/4' },
    ],
  },
];

export function QuantumControls({
  onGateClick,
  onPresetClick,
  onReset,
  notation,
  mode,
  history,
  initialState,
  onUndo,
  onClearHistory,
}: QuantumControlsProps) {
  const isCircle = mode === 'circulo';
  // Letras e iconos en el color del eje: en tema claro, la variante más oscura (3:1 sobre blanco)
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'light' ? 'light' : 'dark';

  // Sin Card propia por sección: la tarjeta la pone Index.tsx y una tarjeta dentro
  // de otra solo resta ancho. Las secciones van separadas por Separator, como en StateDisplay.
  return (
    <div className="space-y-5">
      {/* Quantum Gates */}
      <section className="space-y-3">
        <h4 className={SECTION_LABEL}>Compuertas</h4>
        {GATE_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            <h5 className="text-sm font-medium">{group.label}</h5>
            {/* Siempre tres columnas: cada grupo es una fila, también en la columna estrecha de lg */}
            <div className="grid grid-cols-3 gap-2">
              {group.gates.map((gate) => {
                const rotation = GATE_ROTATIONS[gate.name];
                return (
                  <Tooltip key={gate.name}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="quantum-glow h-14 justify-between px-2.5 transition-all duration-300 hover:scale-105"
                        onClick={() => onGateClick(gate.name)}
                        aria-label={`${gate.name}: ${gate.description}`}
                      >
                        {/* text-xl bold es texto grande: basta 3:1 con el color del eje */}
                        <span className="font-mono text-xl font-bold" style={{ color: axisColor(rotation.axis, theme) }}>
                          {gate.name}
                        </span>
                        {/* El Button de shadcn fuerza los svg a size-4; el icono necesita su tamaño */}
                        <GateIcon rotation={rotation} theme={theme} className="!size-9 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-56">
                      <p className="font-medium">{gate.description}</p>
                      <p className="text-muted-foreground">
                        Rotación de <span className="font-mono tabular-nums">{toDegrees(rotation.angle)}°</span>{' '}
                        alrededor del {rotation.axisLabel}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Cada compuerta es una rotación de la esfera: el icono muestra su eje y el ángulo girado, con el color del eje
          en la esfera. Eje y ángulo exactos al pasar el cursor y en el aviso al aplicarla.
        </p>
      </section>

      <Separator />

      {/* Circuit history */}
      <section>
        <h4 className={`${SECTION_LABEL} mb-3`}>Circuito aplicado</h4>
        {history.length === 0 || !initialState ? (
          <p className="text-xs text-muted-foreground">Aplica una compuerta para empezar el circuito.</p>
        ) : (
          /* Hilo de circuito: estado inicial, compuertas en orden y estado final */
          <div className="overflow-x-auto">
            <div className="flex items-center min-w-max py-1 font-mono text-sm">
              <span className="shrink-0 pr-1">{describeInitial(initialState, notation)}</span>
              {history.map((gate, index) => {
                const rotation = GATE_ROTATIONS[gate];
                return (
                  <span key={`${gate}-${index}`} className="flex items-center">
                    <span className="h-px w-4 bg-border" aria-hidden="true" />
                    {/* La letra va en el color del texto: el borde en el color del eje solo identifica */}
                    <span
                      className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border-2 bg-card px-1.5 font-bold"
                      style={rotation ? { borderColor: axisColor(rotation.axis, theme) } : undefined}
                    >
                      {gate}
                    </span>
                  </span>
                );
              })}
              <span className="h-px w-4 bg-border" aria-hidden="true" />
              <span className="shrink-0 pl-1 text-muted-foreground">|ψ⟩</span>
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="flex-1" onClick={onUndo} disabled={history.length === 0}>
            <Undo2 aria-hidden="true" />
            Deshacer última
          </Button>
          <Button variant="ghost" size="sm" className="flex-1" onClick={onClearHistory} disabled={history.length === 0}>
            <Trash2 aria-hidden="true" />
            Vaciar circuito
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Mover el estado a mano (sliders, click en la esfera o preset) empieza un circuito nuevo.
        </p>
      </section>

      <Separator />

      {/* Preset States */}
      <section>
        <h4 className={`${SECTION_LABEL} mb-3`}>Estados predefinidos</h4>
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
      </section>

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
