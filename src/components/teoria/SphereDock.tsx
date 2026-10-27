import { useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BlochSphere } from '@/components/BlochSphere';
import { StateSummary } from '@/components/StateSummary';
import { ViewModeToggle } from '@/components/ViewModeToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { QubitController } from '@/hooks/use-qubit';
import type { Notation } from '@/lib/notation';

interface SphereDockProps {
  qubit: QubitController;
  notation: Notation;
  notice: string | null;
}

/**
 * La esfera que acompaña al curso: fija (sticky) a la derecha en escritorio y
 * pegada arriba en móvil, con el selector de modo, la lectura del estado y, en
 * móvil, un botón para reducirla y leer más cómodo. Mide su altura y la publica
 * en --dock-h para que los capítulos y los botones no queden debajo al hacer
 * scroll hasta ellos. Sin zoom ni paneo: la rueda encima debe hacer scroll.
 */
export function SphereDock({ qubit, notation, notice }: SphereDockProps) {
  const ref = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const publish = () => root.style.setProperty('--dock-h', `${Math.ceil(el.getBoundingClientRect().height)}px`);
    // Síncrono primero: el scroll a un capítulo (useEffect de Teoria) corre justo después.
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--dock-h');
    };
  }, []);

  return (
    <aside
      ref={ref}
      aria-label="Esfera de Bloch"
      className="sphere-dock sticky top-0 z-10 lg:top-6 lg:self-start lg:order-last lg:col-span-5"
    >
      <Card className="p-3 sm:p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <ViewModeToggle mode={qubit.mode} onChange={qubit.changeMode} descriptionClassName="hidden sm:inline" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0 h-9 w-9"
            aria-pressed={reduced}
            aria-label={reduced ? 'Ampliar la esfera' : 'Reducir la esfera'}
            title={reduced ? 'Ampliar la esfera' : 'Reducir la esfera'}
            onClick={() => setReduced((r) => !r)}
          >
            {reduced ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}
          </Button>
        </div>

        <div className={reduced ? 'h-28 lg:h-[calc(100vh-18rem)] lg:min-h-[320px] lg:max-h-[560px]' : 'h-[30dvh] lg:h-[calc(100vh-18rem)] lg:min-h-[320px] lg:max-h-[560px]'}>
          <BlochSphere
            theta={qubit.theta}
            phi={qubit.phi}
            className="h-full w-full"
            onStateChange={qubit.setFromSphereClick}
            lastRotation={qubit.lastRotation}
            notation={notation}
            mode={qubit.mode}
            onUserOrbit={qubit.exitFixedView}
            enableZoom={false}
            enablePan={false}
          />
        </div>

        {/* En móvil reducido, solo Dirac y el nombre; en escritorio siempre la lectura completa. */}
        <div className={reduced ? 'lg:hidden' : 'hidden'}>
          <StateSummary state={qubit.state} mode={qubit.mode} notation={notation} notice={notice} compact />
        </div>
        <div className={reduced ? 'hidden lg:block' : 'block'}>
          <StateSummary state={qubit.state} mode={qubit.mode} notation={notation} notice={notice} />
        </div>

        <div className="hidden lg:flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={qubit.reset}>
            Reiniciar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => qubit.applyPreset('random')}>
            Aleatorio
          </Button>
        </div>
      </Card>
    </aside>
  );
}
