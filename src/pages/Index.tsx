import { useRef, useState } from 'react';
import { BlochSphere, type AppliedRotation } from '@/components/BlochSphere';
import { QuantumControls } from '@/components/QuantumControls';
import { StateDisplay } from '@/components/StateDisplay';
import { QuantumEducation } from '@/components/QuantumEducation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Home } from 'lucide-react';
import { toast } from 'sonner';
import {
  applyGate as applyGateToState,
  getGateRotation,
  isOnCircle,
  KET_STATES,
  projectToCircle,
  randomState,
  stateFromCircleAngle,
  toBlochVector,
  toSpherical,
  type KetKey,
  type SphericalAngles,
} from '@/lib/bloch';
import { ket, NOTATION_NAMES, NOTATIONS, type Notation } from '@/lib/notation';
import { VIEW_MODES, type ViewMode } from '@/lib/modes';
import { COARSE_POINTER_QUERY, useMediaQuery } from '@/hooks/use-media-query';

/** Una compuerta aplicada y el estado que había antes, para poder deshacerla. */
export interface GateHistoryEntry {
  gate: string;
  from: SphericalAngles;
}

const degrees = (radians: number) => ((radians * 180) / Math.PI).toFixed(1);
const describeState = (s: SphericalAngles) => `θ=${degrees(s.theta)}°, φ=${degrees(s.phi)}°`;

const Index = () => {
  const [theta, setTheta] = useState(Math.PI / 3); // Initial state closer to |+⟩
  const [phi, setPhi] = useState(0);
  // Última compuerta aplicada: la esfera la usa para animar el arco y mostrar el eje.
  // Se pone en null cuando el estado cambia por otro medio (slider, click, preset).
  const [lastRotation, setLastRotation] = useState<AppliedRotation | null>(null);
  const rotationCounter = useRef(0);
  const [notation, setNotation] = useState<Notation>('computacional');
  const [mode, setMode] = useState<ViewMode>('libre');
  // Secuencia de compuertas desde el último estado fijado a mano
  const [history, setHistory] = useState<GateHistoryEntry[]>([]);
  const coarsePointer = useMediaQuery(COARSE_POINTER_QUERY);

  const setState = (next: SphericalAngles) => {
    setTheta(next.theta);
    setPhi(next.phi);
  };

  const animateRotation = (rotation: Omit<AppliedRotation, 'id'>) => {
    rotationCounter.current += 1;
    setLastRotation({ ...rotation, id: rotationCounter.current });
  };

  /** El estado cambió a mano: sin animación de compuerta y el circuito empieza de nuevo. */
  const manualChange = (next: SphericalAngles) => {
    setState(next);
    setLastRotation(null);
    setHistory([]);
  };

  /**
   * En modo círculo (lección 30) solo caben amplitudes reales. Si una acción
   * saca el estado del plano XZ, se explica la limitación y se pasa a la
   * esfera completa (lección 31). Devuelve true si se salió del círculo.
   */
  const leaveCircleIfNeeded = (next: SphericalAngles, cause: string): boolean => {
    if (mode !== 'circulo') return false;
    if (isOnCircle(toBlochVector(next.theta, next.phi))) return false;
    setMode('libre');
    toast('El estado salió del círculo de Bloch', {
      description: `${cause} introduce una fase imaginaria y el círculo no puede representarla. Hace falta el eje Y: la esfera completa.`,
      duration: 7000,
    });
    return true;
  };

  const applyGate = (gate: string) => {
    const rotation = getGateRotation(gate);
    if (!rotation) return;

    const from = { theta, phi };
    const next = applyGateToState(gate, from);
    setState(next);
    animateRotation(rotation);
    setHistory((h) => [...h, { gate, from }]);

    const left = leaveCircleIfNeeded(next, `La compuerta ${gate}`);
    if (!left) {
      toast(`Compuerta ${gate} aplicada`, {
        description: `Rotación de ${degrees(rotation.angle)}° alrededor del ${rotation.axisLabel}. Nuevo estado: ${describeState(next)}`,
      });
    }
  };

  const undoGate = () => {
    const entry = history[history.length - 1];
    if (!entry) return;
    const rotation = getGateRotation(entry.gate);
    setState(entry.from);
    setHistory((h) => h.slice(0, -1));
    if (rotation) {
      // Deshacer es la rotación inversa: mismo eje, ángulo opuesto
      animateRotation({ ...rotation, angle: -rotation.angle, name: `${entry.gate}⁻¹` });
    }
    toast(`Compuerta ${entry.gate} deshecha`, { description: `Estado: ${describeState(entry.from)}` });
  };

  const clearHistory = () => {
    setHistory([]);
    toast('Circuito vaciado', { description: 'El estado actual se conserva como nuevo punto de partida.' });
  };

  const applyPreset = (preset: KetKey | 'random') => {
    if (preset === 'random') {
      // Uniforme sobre la esfera (Haar: cos θ uniforme, no θ); en el círculo basta α uniforme
      const next = mode === 'circulo' ? stateFromCircleAngle(Math.random() * 2 * Math.PI) : randomState();
      manualChange(next);
      toast('Estado aleatorio generado', { description: describeState(next) });
      return;
    }

    const next = KET_STATES[preset];
    manualChange(next);
    const left = leaveCircleIfNeeded(next, `El estado ${ket(preset, notation)}`);
    if (!left) toast(`Estado ${ket(preset, notation)} aplicado`);
  };

  const handleReset = () => {
    manualChange(KET_STATES.zero);
    toast(`Estado reiniciado a ${ket('zero', notation)}`);
  };

  const handleRotationChange = (angle: 'theta' | 'phi' | 'alpha', value: number) => {
    if (angle === 'alpha') {
      manualChange(stateFromCircleAngle(value));
    } else if (angle === 'theta') {
      manualChange({ theta: value, phi });
    } else {
      manualChange({ theta, phi: value });
    }
  };

  const handleSphereClick = (newTheta: number, newPhi: number) => {
    let next: SphericalAngles = { theta: newTheta, phi: newPhi };
    if (mode === 'circulo') {
      // En el círculo solo valen puntos del plano XZ: proyectar el click
      next = toSpherical(projectToCircle(toBlochVector(newTheta, newPhi)));
    }
    manualChange(next);
    toast('Estado actualizado por click en la esfera', { description: describeState(next) });
  };

  const handleModeChange = (next: ViewMode) => {
    if (next === mode) return;
    if (next === 'circulo') {
      const v = toBlochVector(theta, phi);
      if (!isOnCircle(v)) {
        manualChange(toSpherical(projectToCircle(v)));
        toast('Estado proyectado al círculo de Bloch', {
          description: 'Se eliminó la componente Y (la fase imaginaria) para que el estado quepa en el plano XZ.',
        });
      }
    }
    setMode(next);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-quantum bg-clip-text text-transparent">
                Esfera de Bloch
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Visualización y manipulación de estados cuánticos en tiempo real
              </p>
            </div>
            {/* Solo lo global: volver al sitio, notación y tema. Reiniciar y Aleatorio
                viven en los controles, junto a los presets. */}
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <a href="../index.html">
                  <Home aria-hidden="true" />
                  Inicio
                </a>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <ToggleGroup
                type="single"
                size="sm"
                variant="outline"
                value={notation}
                onValueChange={(value) => value && setNotation(value as Notation)}
                aria-label="Notación de los estados"
              >
                {NOTATIONS.map((n) => (
                  <ToggleGroupItem key={n} value={n} className="text-xs font-mono" title={NOTATION_NAMES[n]}>
                    {n === 'computacional' ? '|0⟩ |1⟩ |+⟩' : '|u⟩ |d⟩ |r⟩'}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-6 min-h-full">
          {/* En escritorio las tres tarjetas ocupan la altura de la ventana y hacen scroll
              por dentro; en móvil se apilan con su altura natural: esfera, controles y
              al final el estado, para que las compuertas queden a mano. */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-6 lg:h-[calc(100vh-140px)]">
            {/* Estado Cuántico Actual - Izquierda (última en móvil) */}
            <div className="lg:col-span-2 lg:min-h-0 order-last lg:order-none">
              <Card className="h-full p-4">
                <div className="lg:h-full lg:overflow-y-auto">
                  <StateDisplay
                    theta={theta}
                    phi={phi}
                    notation={notation}
                    mode={mode}
                    onRotationChange={handleRotationChange}
                  />
                </div>
              </Card>
            </div>

            {/* Esfera de Bloch - Centro (primera en móvil) */}
            <div className="lg:col-span-3 lg:min-h-0 order-first lg:order-none">
              <Card className="h-full p-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <ToggleGroup
                    type="single"
                    size="sm"
                    variant="outline"
                    value={mode}
                    onValueChange={(value) => value && handleModeChange(value as ViewMode)}
                    aria-label="Modo de visualización"
                  >
                    {VIEW_MODES.map((m) => (
                      <ToggleGroupItem key={m.value} value={m.value} className="text-xs" title={m.description}>
                        {m.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <span className="text-xs text-muted-foreground">
                    {(() => {
                      const current = VIEW_MODES.find((m) => m.value === mode);
                      return (coarsePointer && current?.touchDescription) || current?.description;
                    })()}
                  </span>
                </div>
                <div className="h-[60vh] lg:h-auto lg:flex-1 lg:min-h-0">
                  <BlochSphere
                    theta={theta}
                    phi={phi}
                    className="h-full w-full"
                    onStateChange={handleSphereClick}
                    lastRotation={lastRotation}
                    notation={notation}
                    mode={mode}
                    onUserOrbit={() => setMode('libre')}
                  />
                </div>
              </Card>
            </div>

            {/* Controles y Teoría - Derecha */}
            <div className="lg:col-span-2 lg:min-h-0">
              <Card className="h-full p-4">
                <div className="lg:h-full lg:overflow-y-hidden">
                  <Tabs defaultValue="controls" className="w-full lg:h-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="controls">Controles</TabsTrigger>
                      <TabsTrigger value="theory">Teoría</TabsTrigger>
                    </TabsList>

                    <TabsContent value="controls" className="mt-4 lg:h-[calc(100%-2.5rem)]">
                      <div className="lg:h-full lg:overflow-y-auto">
                        <QuantumControls
                          onGateClick={applyGate}
                          onPresetClick={applyPreset}
                          onReset={handleReset}
                          notation={notation}
                          mode={mode}
                          history={history.map((h) => h.gate)}
                          onUndo={undoGate}
                          onClearHistory={clearHistory}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="theory" className="mt-4 lg:h-[calc(100%-2.5rem)]">
                      <div className="lg:h-full lg:overflow-y-auto">
                        <QuantumEducation notation={notation} onSelectMode={handleModeChange} onPreset={applyPreset} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
