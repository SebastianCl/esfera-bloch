import { useRef, useState } from 'react';
import { BlochSphere } from '@/components/BlochSphere';
import { QuantumControls } from '@/components/QuantumControls';
import { StateDisplay } from '@/components/StateDisplay';
import { QuantumEducation } from '@/components/QuantumEducation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { applyGate as applyGateToState, getGateRotation } from '@/lib/bloch';
import type { AppliedRotation } from '@/components/BlochSphere';

const Index = () => {
  const [theta, setTheta] = useState(Math.PI / 3); // Initial state closer to |+⟩
  const [phi, setPhi] = useState(0);
  // Última compuerta aplicada: la esfera la usa para animar el arco y mostrar el eje.
  // Se pone en null cuando el estado cambia por otro medio (slider, click, preset).
  const [lastRotation, setLastRotation] = useState<AppliedRotation | null>(null);
  const rotationCounter = useRef(0);

  const applyGate = (gate: string) => {
    const rotation = getGateRotation(gate);
    if (!rotation) return;

    const { theta: newTheta, phi: newPhi } = applyGateToState(gate, { theta, phi });

    setTheta(newTheta);
    setPhi(newPhi);
    rotationCounter.current += 1;
    setLastRotation({ ...rotation, id: rotationCounter.current });

    toast(`Compuerta ${gate} aplicada`, {
      description: `Nuevo estado: θ=${(newTheta * 180 / Math.PI).toFixed(1)}°, φ=${(newPhi * 180 / Math.PI).toFixed(1)}°`
    });
  };

  const applyPreset = (preset: string) => {
    let newTheta = 0;
    let newPhi = 0;

    switch (preset) {
      case '|0⟩':
        newTheta = 0;
        newPhi = 0;
        break;
      case '|1⟩':
        newTheta = Math.PI;
        newPhi = 0;
        break;
      case '|+⟩':
        newTheta = Math.PI / 2;
        newPhi = 0;
        break;
      case '|-⟩':
        newTheta = Math.PI / 2;
        newPhi = Math.PI;
        break;
      case '|+i⟩':
        newTheta = Math.PI / 2;
        newPhi = Math.PI / 2;
        break;
      case '|-i⟩':
        newTheta = Math.PI / 2;
        newPhi = -Math.PI / 2;
        break;
      case 'random':
        newTheta = Math.random() * Math.PI;
        newPhi = (Math.random() - 0.5) * 2 * Math.PI;
        break;
    }

    setTheta(newTheta);
    setPhi(newPhi);
    setLastRotation(null);

    if (preset !== 'random') {
      toast(`Estado ${preset} aplicado`);
    } else {
      toast('Estado aleatorio generado');
    }
  };

  const handleReset = () => {
    setTheta(0);
    setPhi(0);
    setLastRotation(null);
    toast('Estado reiniciado a |0⟩');
  };

  const handleRotationChange = (angle: 'theta' | 'phi', value: number) => {
    if (angle === 'theta') {
      setTheta(value);
    } else {
      setPhi(value);
    }
    setLastRotation(null);
  };

  const handleSphereClick = (newTheta: number, newPhi: number) => {
    setTheta(newTheta);
    setPhi(newPhi);
    setLastRotation(null);
    toast('Estado actualizado por click en la esfera', {
      description: `θ=${(newTheta * 180 / Math.PI).toFixed(1)}°, φ=${(newPhi * 180 / Math.PI).toFixed(1)}°`
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-quantum bg-clip-text text-transparent">
                Esfera de Bloch
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Visualización y manipulación de estados cuánticos en tiempo real
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="../index.html"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white h-9 px-3 shadow-md hover:shadow-lg"
                style={{ textDecoration: 'none' }}
              >
                <span className="mr-2">🏠</span>
                Inicio
              </a>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reiniciar
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('random')}>
                Aleatorio
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-6 min-h-full">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 min-h-[calc(100vh-140px)]">


            {/* Estado Cuántico Actual - Izquierda */}
            <div className="lg:col-span-2">
              <Card className="h-full p-4">
                <div className="h-full overflow-hidden">
                  <StateDisplay theta={theta} phi={phi} />
                </div>
              </Card>
            </div>

            {/* Esfera de Bloch - Centro */}
            <div className="lg:col-span-3">
              <Card className="h-full p-4">
                <div className="h-full">
                  <BlochSphere
                    theta={theta}
                    phi={phi}
                    className="h-full w-full"
                    onStateChange={handleSphereClick}
                    lastRotation={lastRotation}
                  />
                </div>
              </Card>
            </div>

            {/* Controles y Teoría - Derecha */}
            <div className="lg:col-span-2">
              <Card className="h-full p-4">
                <div className="h-full overflow-y-hidden">
                  <Tabs defaultValue="controls" className="w-full h-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="controls">Controles</TabsTrigger>
                      <TabsTrigger value="theory">Teoría</TabsTrigger>
                    </TabsList>

                    <TabsContent value="controls" className="mt-4 h-[calc(100%-2.5rem)]">
                      <div className="h-full overflow-y-auto">
                        <QuantumControls
                          onGateClick={applyGate}
                          onPresetClick={applyPreset}
                          onReset={handleReset}
                          theta={theta}
                          phi={phi}
                          onRotationChange={handleRotationChange}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="theory" className="mt-4 h-[calc(100%-2.5rem)]">
                      <div className="h-full overflow-y-auto">
                        <QuantumEducation />
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
