import { useState } from 'react';
import { BlochSphere } from '@/components/BlochSphere';
import { QuantumControls } from '@/components/QuantumControls';
import { StateDisplay } from '@/components/StateDisplay';
import { QuantumEducation } from '@/components/QuantumEducation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Vector de Bloch en convención física (Z vertical, |0⟩ en z=+1)
interface BlochVector {
  x: number;
  y: number;
  z: number;
}

const toBlochVector = (theta: number, phi: number): BlochVector => ({
  x: Math.sin(theta) * Math.cos(phi),
  y: Math.sin(theta) * Math.sin(phi),
  z: Math.cos(theta),
});

// Elimina residuos de punto flotante (p. ej. 6e-17 o -0) para que
// atan2/acos y la pantalla no muestren valores como "-0.0°"
const clean = (value: number): number => (Math.abs(value) < 1e-12 ? 0 : value);

// Vuelve a esféricas: θ ∈ [0, π], φ ∈ (-π, π]. En los polos φ queda en 0.
const toSpherical = (v: BlochVector): { theta: number; phi: number } => {
  const x = clean(v.x);
  const y = clean(v.y);
  const z = clean(v.z);
  const theta = Math.acos(Math.max(-1, Math.min(1, z)));
  let phi = Math.atan2(y, x);
  if (Math.abs(phi + Math.PI) < 1e-9) phi = Math.PI;
  return { theta, phi };
};

// Rotación de ángulo `angle` alrededor del eje Z
const rotateZ = (v: BlochVector, angle: number): BlochVector => ({
  x: v.x * Math.cos(angle) - v.y * Math.sin(angle),
  y: v.x * Math.sin(angle) + v.y * Math.cos(angle),
  z: v.z,
});

// Cada compuerta de un qubit es una rotación de la esfera de Bloch.
// Se aplica sobre el vector cartesiano y luego se vuelve a θ/φ.
const applyGateToVector = (gate: string, v: BlochVector): BlochVector => {
  switch (gate) {
    case 'X':
      // Rotación π alrededor de X: (x, y, z) → (x, -y, -z)
      return { x: v.x, y: -v.y, z: -v.z };
    case 'Y':
      // Rotación π alrededor de Y: (x, y, z) → (-x, y, -z)
      return { x: -v.x, y: v.y, z: -v.z };
    case 'Z':
      // Rotación π alrededor de Z: (x, y, z) → (-x, -y, z)
      return { x: -v.x, y: -v.y, z: v.z };
    case 'H':
      // Rotación π alrededor del eje (X+Z)/√2: intercambia x↔z e invierte y
      return { x: v.z, y: -v.y, z: v.x };
    case 'S':
      // Rotación π/2 alrededor de Z
      return rotateZ(v, Math.PI / 2);
    case 'T':
      // Rotación π/4 alrededor de Z
      return rotateZ(v, Math.PI / 4);
    default:
      return v;
  }
};

const Index = () => {
  const [theta, setTheta] = useState(Math.PI / 3); // Initial state closer to |+⟩
  const [phi, setPhi] = useState(0);

  const applyGate = (gate: string) => {
    const rotated = applyGateToVector(gate, toBlochVector(theta, phi));
    const { theta: newTheta, phi: newPhi } = toSpherical(rotated);

    setTheta(newTheta);
    setPhi(newPhi);

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

    if (preset !== 'random') {
      toast(`Estado ${preset} aplicado`);
    } else {
      toast('Estado aleatorio generado');
    }
  };

  const handleReset = () => {
    setTheta(0);
    setPhi(0);
    toast('Estado reiniciado a |0⟩');
  };

  const handleRotationChange = (axis: string, value: number) => {
    if (axis === 'x') {
      setTheta(value);
    } else if (axis === 'y') {
      setPhi(value);
    }
  };

  const handleSphereClick = (newTheta: number, newPhi: number) => {
    setTheta(newTheta);
    setPhi(newPhi);
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
