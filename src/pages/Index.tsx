import { useEffect } from 'react';
import { toast } from 'sonner';
import { AppHeader } from '@/components/AppHeader';
import { BlochSphere } from '@/components/BlochSphere';
import { QuantumControls } from '@/components/QuantumControls';
import { QuantumEducation } from '@/components/QuantumEducation';
import { StateDisplay } from '@/components/StateDisplay';
import { ViewModeToggle } from '@/components/ViewModeToggle';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotation } from '@/hooks/use-notation';
import { useQubit } from '@/hooks/use-qubit';

const Index = () => {
  const { notation } = useNotation();
  // El estado del qubit y sus acciones viven en useQubit, compartido con el curso.
  // En el laboratorio cada aviso se muestra como toast de sonner.
  const q = useQubit({
    notation,
    notify: (n) => toast(n.title, { description: n.description, duration: n.duration }),
  });

  // Con hash router no hay restauración de scroll: al volver del curso en móvil, arriba.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader subtitle="Visualización y manipulación de estados cuánticos en tiempo real" />

      {/* Main Content */}
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-6 min-h-full">
          {/* En escritorio las tres tarjetas ocupan la altura de la ventana y hacen scroll
              por dentro (panel-scroll: barra fina y pr-3 para que no toque el contenido);
              en móvil se apilan con su altura natural: esfera, controles y al final el
              estado, para que las compuertas queden a mano. */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-6 lg:h-[calc(100vh-140px)]">
            {/* Estado Cuántico Actual - Izquierda (última en móvil) */}
            <div className="lg:col-span-2 lg:min-h-0 order-last lg:order-none">
              <Card className="h-full p-4">
                <div className="panel-scroll lg:h-full lg:overflow-y-auto lg:pr-3">
                  <StateDisplay
                    theta={q.theta}
                    phi={q.phi}
                    notation={notation}
                    mode={q.mode}
                    onRotationChange={q.setAngle}
                  />
                </div>
              </Card>
            </div>

            {/* Esfera de Bloch - Centro (primera en móvil) */}
            <div className="lg:col-span-3 lg:min-h-0 order-first lg:order-none">
              <Card className="h-full p-4 flex flex-col gap-3">
                <ViewModeToggle mode={q.mode} onChange={q.changeMode} />
                <div className="h-[60vh] lg:h-auto lg:flex-1 lg:min-h-0">
                  <BlochSphere
                    theta={q.theta}
                    phi={q.phi}
                    className="h-full w-full"
                    onStateChange={q.setFromSphereClick}
                    lastRotation={q.lastRotation}
                    notation={notation}
                    mode={q.mode}
                    onUserOrbit={q.exitFixedView}
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
                      <div className="panel-scroll lg:h-full lg:overflow-y-auto lg:pr-3">
                        <QuantumControls
                          onGateClick={q.applyGate}
                          onPresetClick={q.applyPreset}
                          onReset={q.reset}
                          notation={notation}
                          mode={q.mode}
                          history={q.history.map((h) => h.gate)}
                          initialState={q.history[0]?.from}
                          onUndo={q.undoGate}
                          onClearHistory={q.clearHistory}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="theory" className="mt-4 lg:h-[calc(100%-2.5rem)]">
                      <div className="panel-scroll lg:h-full lg:overflow-y-auto lg:pr-3">
                        <QuantumEducation notation={notation} onSelectMode={q.changeMode} onPreset={q.applyPreset} />
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
