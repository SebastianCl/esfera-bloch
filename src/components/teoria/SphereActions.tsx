import { Button } from '@/components/ui/button';
import { LabelText } from '@/components/teoria/LabelText';
import { labelText, sphereActionLabel, type Sequence, type SphereAction } from '@/lib/course';
import type { Notation } from '@/lib/notation';
import { KICKER } from '@/lib/styles';

interface SphereActionsProps {
  sequence: Sequence;
  run: (action: SphereAction) => void;
  notation: Notation;
}

// scroll-mt: un botón enfocado con teclado no debe quedar bajo el dock fijo (móvil).
const BUTTON_CLASS = 'scroll-mt-[var(--dock-h,0px)] lg:scroll-mt-0';

/**
 * Los botones de una demostración o de la preparación de un ejercicio. Un solo
 * paso es un botón; varios pasos son botones numerados dentro de un grupo:
 * cada clic ejecuta una acción, el alumno marca el ritmo y ve cada arco.
 */
export function SphereActions({ sequence, run, notation }: SphereActionsProps) {
  const { steps, label } = sequence;

  if (steps.length === 1) {
    const step = steps[0];
    return (
      <Button size="sm" variant="outline" className={BUTTON_CLASS} onClick={() => run(step)}>
        <LabelText parts={label ?? sphereActionLabel(step)} notation={notation} />
      </Button>
    );
  }

  const groupLabel = label ?? [];
  return (
    <div role="group" aria-label={labelText(groupLabel, notation)} className="space-y-1">
      {groupLabel.length > 0 && (
        <p className={`${KICKER} font-medium`}>
          <LabelText parts={groupLabel} notation={notation} />
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">→</span>}
            <Button size="sm" variant="outline" className={BUTTON_CLASS} onClick={() => run(step)}>
              <span className="text-muted-foreground">{i + 1}.</span>
              <LabelText parts={sphereActionLabel(step)} notation={notation} />
            </Button>
          </span>
        ))}
      </div>
    </div>
  );
}

interface DemoListProps {
  demos: Sequence[];
  run: (action: SphereAction) => void;
  notation: Notation;
}

/** Las demostraciones de un capítulo: los botones sueltos en una fila, cada secuencia en la suya. */
export function DemoList({ demos, run, notation }: DemoListProps) {
  const rows: Sequence[][] = [];
  for (const demo of demos) {
    const last = rows[rows.length - 1];
    if (demo.steps.length === 1 && last && last[0].steps.length === 1) {
      last.push(demo);
    } else {
      rows.push([demo]);
    }
  }

  return (
    <div className="space-y-3">
      {rows.map((row, i) =>
        row[0].steps.length === 1 ? (
          <div key={i} className="flex flex-wrap gap-2">
            {row.map((demo, j) => (
              <SphereActions key={j} sequence={demo} run={run} notation={notation} />
            ))}
          </div>
        ) : (
          <SphereActions key={i} sequence={row[0]} run={run} notation={notation} />
        ),
      )}
    </div>
  );
}
