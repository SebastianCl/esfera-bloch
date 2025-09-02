import { useState } from 'react';
import { BlochSphere } from '@/components/BlochSphere';
import { QuantumControls } from '@/components/QuantumControls';
import { StateDisplay } from '@/components/StateDisplay';
import { QuantumEducation } from '@/components/QuantumEducation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Index = () => {
  const [theta, setTheta] = useState(Math.PI / 3); // Initial state closer to |+⟩
  const [phi, setPhi] = useState(0);

  const applyGate = (gate: string) => {
    let newTheta = theta;
    let newPhi = phi;

    switch (gate) {
      case 'X':
        // Pauli-X: flip around X-axis
        newTheta = Math.PI - theta;
        newPhi = phi + Math.PI;
        break;
      case 'Y':
        // Pauli-Y: flip around Y-axis
        newTheta = Math.PI - theta;
        newPhi = -phi;
        break;
      case 'Z':
        // Pauli-Z: phase flip
        newPhi = phi + Math.PI;
        break;
      case 'H':
        // Hadamard: complex transformation
        if (Math.abs(theta) < 0.1) {
          // |0⟩ → |+⟩
          newTheta = Math.PI / 2;
          newPhi = 0;
        } else if (Math.abs(theta - Math.PI) < 0.1) {
          // |1⟩ → |-⟩
          newTheta = Math.PI / 2;
          newPhi = Math.PI;
        } else {
          // Apply Hadamard transformation
          newTheta = Math.PI / 2;
          newPhi = phi;
        }
        break;
      case 'S':
        // S gate: phase by π/2
        newPhi = phi + Math.PI / 2;
        break;
      case 'T':
        // T gate: phase by π/4
        newPhi = phi + Math.PI / 4;
        break;
    }

    // Normalize angles
    newPhi = ((newPhi + Math.PI) % (2 * Math.PI)) - Math.PI;
    newTheta = Math.max(0, Math.min(Math.PI, newTheta));

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-quantum bg-clip-text text-transparent">
                Esfera de Bloch Interactiva
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Visualización y manipulación de estados cuánticos en tiempo real
              </p>
            </div>
            <div className="flex items-center gap-2">
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
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          
          {/* 3D Visualization */}
          <div className="lg:col-span-2">
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

          {/* Controls and Information */}
          <div className="space-y-4 overflow-y-auto">
            <Tabs defaultValue="controls" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="controls">Controles</TabsTrigger>
                <TabsTrigger value="state">Estado</TabsTrigger>
                <TabsTrigger value="theory">Teoría</TabsTrigger>
              </TabsList>
              
              <TabsContent value="controls" className="mt-4">
                <QuantumControls
                  onGateClick={applyGate}
                  onPresetClick={applyPreset}
                  onReset={handleReset}
                  theta={theta}
                  phi={phi}
                  onRotationChange={handleRotationChange}
                />
              </TabsContent>
              
              <TabsContent value="state" className="mt-4">
                <StateDisplay theta={theta} phi={phi} />
              </TabsContent>
              
              <TabsContent value="theory" className="mt-4">
                <QuantumEducation />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Herramienta educativa para computación cuántica</p>
            <p>Esfera de Bloch • Estados cuánticos • Compuertas</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
