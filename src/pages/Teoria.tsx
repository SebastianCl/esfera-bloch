import { AppHeader } from '@/components/AppHeader';

// Esqueleto de la página del curso: el contenido llega en los bloques siguientes.
const Teoria = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <AppHeader subtitle="Curso: del fasor a la esfera de Bloch" />
    <main className="flex-1 bg-background">
      <div className="container mx-auto px-4 py-6">
        <p className="text-sm text-muted-foreground">El curso se está construyendo.</p>
      </div>
    </main>
  </div>
);

export default Teoria;
