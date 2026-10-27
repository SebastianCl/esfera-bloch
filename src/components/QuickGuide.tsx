import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AnglesSummary } from '@/components/AnglesSummary';
import { EigenstateTable } from '@/components/EigenstateTable';
import { GateTable } from '@/components/GateTable';
import type { KetKey } from '@/lib/bloch';
import type { Notation } from '@/lib/notation';
import { SECTION_LABEL } from '@/lib/styles';

interface QuickGuideProps {
  notation: Notation;
  onPreset: (key: KetKey) => void;
  onGate: (gate: string) => void;
}

/** Enlace a un capítulo del curso (ruta con hash: siempre Link, nunca <a href="#…">). */
function ChapterLink({ slug, n }: { slug: string; n: number }) {
  return (
    <Link to={`/teoria/${slug}`} className="text-xs text-muted-foreground underline-offset-2 hover:underline hover:text-primary">
      Capítulo {n} del curso →
    </Link>
  );
}

/**
 * Referencia corta para consultar mientras se manipula la esfera: las tablas
 * compartidas con el curso y enlaces a sus capítulos. La prosa larga vive solo
 * en el curso. Sin Card propia: la tarjeta la pone Index.tsx y el título es la pestaña.
 */
export function QuickGuide({ notation, onPreset, onGate }: QuickGuideProps) {
  return (
    <div className="space-y-5 text-sm text-muted-foreground">
      <section className="space-y-3">
        <p className="text-xs">Resumen de referencia. La teoría completa, con ejercicios, está en el curso.</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/teoria">
            <BookOpen aria-hidden="true" />
            Ir al curso
          </Link>
        </Button>
      </section>

      <Separator />

      <section className="space-y-2">
        <h4 className={SECTION_LABEL}>Los seis autoestados</h4>
        <EigenstateTable notation={notation} onPreset={onPreset} />
        <p className="text-xs">Haz clic en un nombre para llevar el estado hasta él.</p>
        <ChapterLink slug="autoestados" n={5} />
      </section>

      <Separator />

      <section className="space-y-2">
        <h4 className={SECTION_LABEL}>Compuertas</h4>
        <GateTable notation={notation} onGate={onGate} />
        <ChapterLink slug="compuertas" n={7} />
      </section>

      <Separator />

      <section className="space-y-2">
        <h4 className={SECTION_LABEL}>Coordenadas θ y φ</h4>
        <AnglesSummary notation={notation} />
        <ChapterLink slug="coordenadas" n={6} />
      </section>
    </div>
  );
}
