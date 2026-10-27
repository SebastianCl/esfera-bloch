import { EigenstateTable } from '@/components/EigenstateTable';
import { Chapter } from '@/components/teoria/Chapter';
import { Exercise } from '@/components/teoria/Exercise';
import { DemoList } from '@/components/teoria/SphereActions';
import { DEMOS, type ChapterProps } from '@/lib/course';
import { KET_LABELS, ket } from '@/lib/notation';
import { SECTION_LABEL } from '@/lib/styles';

export function CapituloAutoestados({ notation, run }: ChapterProps) {
  const u = ket('zero', notation);
  const d = ket('one', notation);
  const i = ket('plusI', notation);
  const o = ket('minusI', notation);

  return (
    <Chapter
      slug="autoestados"
      exercise={
        <Exercise
          slug="autoestados"
          run={run}
          notation={notation}
          question={
            <p>
              Sin mirar la tabla: ¿qué autoestado es ({u} − i{d})/√2, de qué operador y en qué eje de la esfera?
              Escríbelo en las dos notaciones. ¿Hay más autoestados en la esfera que esos seis?
            </p>
          }
          answer={
            <>
              <p>
                Es {KET_LABELS.curso.minusI} (out, saliente) en la notación del curso y {KET_LABELS.computacional.minusI} en
                la de computación: el autoestado «−» de S<sub>y</sub>, en −Y, −i en el plano complejo. Su opuesto en +Y es{' '}
                {KET_LABELS.curso.plusI} = {KET_LABELS.computacional.plusI} = ({u} + i{d})/√2.
              </p>
              <p>
                Y sí, hay infinitos: cualquier eje n̂ tiene dos autoestados, sus dos extremos, a 180° uno del otro; los
                seis de la tabla son los de los tres ejes de coordenadas. En el capítulo 8 se mide a lo largo de
                cualquier eje.
              </p>
            </>
          }
        />
      }
    >
      <p>
        Cada eje de la esfera corresponde a un operador de espín (S<sub>z</sub>, S<sub>x</sub>, S<sub>y</sub>) y sus dos
        autoestados son los extremos opuestos del eje. La notación del curso, up/down, right/left, in/out de Susskind, y
        la de computación cuántica nombran lo mismo; el selector del encabezado elige cuál se usa en todo el curso:
      </p>
      <EigenstateTable notation={notation} onPreset={(key) => run({ type: 'preset', key })} />
      <p className="text-xs text-muted-foreground">Haz clic en un nombre para llevar la esfera hasta él.</p>
      <p>
        La tabla no agota la esfera: cualquier eje n̂ define una base ortonormal con sus dos extremos ({i} y {o} son los
        del eje Y, por ejemplo). Los seis de arriba son los de los tres ejes de coordenadas, los que una medida de
        S<sub>x</sub>, S<sub>y</sub> o S<sub>z</sub> distingue con certeza.
      </p>
      <h3 className={SECTION_LABEL}>En la esfera</h3>
      <DemoList demos={DEMOS.autoestados} run={run} notation={notation} />
    </Chapter>
  );
}
