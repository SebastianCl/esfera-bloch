import { useEffect, useRef, useState, type ComponentType } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Callout } from '@/components/teoria/Callout';
import { CourseToc } from '@/components/teoria/CourseToc';
import { SphereDock } from '@/components/teoria/SphereDock';
import { CapituloAutoestados } from '@/components/teoria/chapters/Autoestados';
import { CapituloCirculo } from '@/components/teoria/chapters/Circulo';
import { CapituloCompuertas } from '@/components/teoria/chapters/Compuertas';
import { CapituloCoordenadas } from '@/components/teoria/chapters/Coordenadas';
import { CapituloDensidad } from '@/components/teoria/chapters/Densidad';
import { CapituloEjeY } from '@/components/teoria/chapters/EjeY';
import { CapituloErrores } from '@/components/teoria/chapters/Errores';
import { CapituloFasor } from '@/components/teoria/chapters/Fasor';
import { CapituloHilbertBorn } from '@/components/teoria/chapters/HilbertBorn';
import { CapituloMedicion } from '@/components/teoria/chapters/Medicion';
import { useNotation } from '@/hooks/use-notation';
import { useQubit, type QubitNotice } from '@/hooks/use-qubit';
import { KET_STATES } from '@/lib/bloch';
import { CHAPTERS, type ChapterProps, type ChapterSlug } from '@/lib/course';
import { KET_KEYS, KET_LABELS } from '@/lib/notation';
import { CHAPTER_TITLE } from '@/lib/styles';

const NOTICE_MS = 7000;

// Un componente por capítulo; el Record obliga a que estén los diez.
const CHAPTER_COMPONENTS: Record<ChapterSlug, ComponentType<ChapterProps>> = {
  fasor: CapituloFasor,
  'hilbert-born': CapituloHilbertBorn,
  circulo: CapituloCirculo,
  'eje-y': CapituloEjeY,
  autoestados: CapituloAutoestados,
  coordenadas: CapituloCoordenadas,
  compuertas: CapituloCompuertas,
  medicion: CapituloMedicion,
  densidad: CapituloDensidad,
  errores: CapituloErrores,
};

/**
 * El curso: el texto hace scroll y una sola esfera lo acompaña (sticky). Cada
 * página tiene su propio qubit; aquí arranca en |0⟩ y, en vez de toasts, solo
 * los dos avisos del círculo de Bloch se muestran en línea bajo la esfera.
 */
const Teoria = () => {
  const { notation } = useNotation();
  const { capitulo } = useParams();
  const location = useLocation();

  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);
  const showNotice = (n: QubitNotice) => {
    if (!n.kind.startsWith('circle-')) return;
    setNotice(n.description ? `${n.title}. ${n.description}` : n.title);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), NOTICE_MS);
  };
  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const qubit = useQubit({ notation, initial: KET_STATES.zero, notify: showNotice });

  // Enlace profundo a un capítulo (parámetro de ruta). HashRouter no restaura el
  // scroll, así que sin capítulo se va arriba; location.key hace que repetir el
  // clic en el índice vuelva a desplazar.
  useEffect(() => {
    const el = capitulo ? document.getElementById(capitulo) : null;
    if (el) el.scrollIntoView({ block: 'start' });
    else window.scrollTo({ top: 0 });
  }, [capitulo, location.key]);

  const chapterProps: ChapterProps = { notation, state: qubit.state, mode: qubit.mode, run: qubit.run };
  const serie = (n: 'curso' | 'computacional') => KET_KEYS.map((key) => KET_LABELS[n][key]).join(' ');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader subtitle="Curso: del fasor a la esfera de Bloch" />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* El dock va primero en el DOM (en móvil queda pegado arriba, y el orden de
              lectura coincide con el visual); en lg pasa a la derecha. */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 lg:items-start">
            <SphereDock qubit={qubit} notation={notation} notice={notice} />

            <div className="lg:col-span-7">
              <div className="max-w-prose space-y-12">
                <div className="space-y-4">
                  <h2 className={CHAPTER_TITLE}>Del fasor a la esfera de Bloch</h2>
                  <p className="text-sm leading-relaxed text-foreground">
                    Diez capítulos que siguen las lecciones 30 (<em>Píntame el estado</em>) y 31 (<em>La esfera de Bloch</em>)
                    del curso Mundo Cuántico y las amplían. Cada capítulo mueve la esfera con sus botones y termina con un
                    ejercicio de autocomprobación.
                  </p>
                  <Callout label="Notación">
                    <p>
                      <span className="font-mono">{serie('curso')}</span> y{' '}
                      <span className="font-mono">{serie('computacional')}</span> nombran los mismos seis estados: la
                      primera serie es la del curso (Susskind), la segunda la de computación cuántica. El selector del
                      encabezado cambia el nombre en todo el curso y en la esfera.
                    </p>
                  </Callout>
                  <CourseToc />
                </div>

                <div className="space-y-12">
                  {CHAPTERS.map((c) => {
                    const Component = CHAPTER_COMPONENTS[c.slug];
                    return <Component key={c.slug} {...chapterProps} />;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Teoria;
