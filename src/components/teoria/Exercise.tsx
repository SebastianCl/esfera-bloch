import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SphereActions } from '@/components/teoria/SphereActions';
import { EXERCISES, type ChapterSlug, type SphereAction } from '@/lib/course';
import type { Notation } from '@/lib/notation';
import { SECTION_LABEL } from '@/lib/styles';

interface ExerciseProps {
  slug: ChapterSlug;
  question: ReactNode;
  answer: ReactNode;
  run: (action: SphereAction) => void;
  notation: Notation;
}

/**
 * Ejercicio de autocomprobación: pregunta, preparación en la esfera (antes de
 * revelar nada: predecir → preparar → leer → comprobar) y respuesta plegada con
 * sus comprobaciones. Los pasos salen de EXERCISES[slug], que el test verifica.
 */
export function Exercise({ slug, question, answer, run, notation }: ExerciseProps) {
  const [open, setOpen] = useState(false);
  const exercise = EXERCISES[slug];

  return (
    <section aria-labelledby={`${slug}-ejercicio`} className="rounded-md border border-border/40 bg-muted/30 p-4 space-y-3">
      <h3 id={`${slug}-ejercicio`} className={SECTION_LABEL}>
        Ejercicio de autocomprobación
      </h3>
      <div className="text-sm text-foreground">{question}</div>
      <p className="text-xs text-muted-foreground">
        Prepáralo en la esfera y lee el resultado bajo ella antes de ver la respuesta.
      </p>
      <SphereActions sequence={{ label: [{ text: 'Preparación en la esfera' }], steps: exercise.setup }} run={run} notation={notation} />
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="scroll-mt-[var(--dock-h,0px)] lg:scroll-mt-0 [&[data-state=open]>svg]:rotate-180"
          >
            {open ? 'Ocultar la respuesta' : 'Ver la respuesta'}
            <ChevronDown aria-hidden="true" className="transition-transform" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 text-sm text-foreground space-y-3">
          <div className="space-y-2">{answer}</div>
          {exercise.checks?.map((check, i) => (
            <div key={i} className="space-y-1">
              {i === 0 && <p className="text-xs text-muted-foreground">Comprobar:</p>}
              <SphereActions sequence={check} run={run} notation={notation} />
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
