import { Callout } from '@/components/teoria/Callout';
import { Chapter } from '@/components/teoria/Chapter';
import { Disclosure } from '@/components/teoria/Disclosure';
import { Exercise } from '@/components/teoria/Exercise';
import { DemoList } from '@/components/teoria/SphereActions';
import { DEMOS, type ChapterProps } from '@/lib/course';
import { KET_LABELS, ket } from '@/lib/notation';
import { SECTION_LABEL } from '@/lib/styles';

export function CapituloHilbertBorn({ notation, run }: ChapterProps) {
  const u = ket('zero', notation);
  const d = ket('one', notation);
  const r = ket('plus', notation);
  const l = ket('minus', notation);

  return (
    <Chapter
      slug="hilbert-born"
      exercise={
        <Exercise
          slug="hilbert-born"
          run={run}
          notation={notation}
          question={
            <p>
              {l} = ({u} − {d})/√2 lleva un signo menos. ¿Cambia ese signo las probabilidades de medir S<sub>z</sub>? ¿Es{' '}
              {l} el mismo estado que {r} = ({u} + {d})/√2? ¿Y −{r} = (−{u} − {d})/√2, es un estado distinto de {r}?
            </p>
          }
          answer={
            <>
              <p>
                No cambia las probabilidades en Z: P({u}) = (1/√2)² = ½ y P({d}) = (−1/√2)² = ½, las mismas que para{' '}
                {r}. Pero {l} sí es otro estado: el signo está entre las dos amplitudes (fase relativa, φ = 180°). En la
                esfera {r} y {l} son los dos extremos del eje X y al medir S<sub>x</sub> dan resultados opuestos con
                certeza: X {r} 100 % frente a {l} 100 %.
              </p>
              <p>
                −{r} no es distinto: ese −1 multiplica a las dos amplitudes, es una fase global, no se puede medir y es
                el mismo punto de la esfera (la lectura lo escribe con α real ≥ 0). Así que {l} = −{r} es falso; el
                capítulo 10 lo retoma.
              </p>
            </>
          }
        />
      }
    >
      <p>Un estado se escribe como combinación lineal de los vectores de la base:</p>
      <div className="math-formula text-center">
        |ψ⟩ = a<sub>u</sub>{u} + a<sub>d</sub>{d}
      </div>
      <Callout label="Notación">
        <p>
          {KET_LABELS.curso.zero} y {KET_LABELS.curso.one} (up y down, los nombres del curso) son {KET_LABELS.computacional.zero} y{' '}
          {KET_LABELS.computacional.one} de computación cuántica. El selector del encabezado cambia el nombre en todo el
          curso y en la esfera; la física es la misma.
        </p>
      </Callout>
      <p>
        A diferencia de un vector geométrico, en el espacio de Hilbert todo estado físico tiene norma 1. La regla de Born
        convierte las amplitudes en probabilidades:
      </p>
      <div className="math-formula text-center">
        P({u}) = |a<sub>u</sub>|², P({d}) = |a<sub>d</sub>|², |a<sub>u</sub>|² + |a<sub>d</sub>|² = 1
      </div>
      <p>
        El ejemplo de la lección: {l} = ({u} − {d})/√2 tiene a<sub>u</sub> = 1/√2 y a<sub>d</sub> = −1/√2, así que medir
        S<sub>z</sub> da {u} o {d} con probabilidad ½ cada uno. El signo no se nota en Z, pero no es inocente: distingue{' '}
        {l} de {r}.
      </p>
      <p>
        Con amplitudes reales, la condición de norma 1 deja una circunferencia (capítulo 3). Con amplitudes complejas
        son cuatro números reales con una ligadura. Pero |ψ⟩ y e<sup>iγ</sup>|ψ⟩ son el mismo estado físico: la fase
        global γ no cambia ninguna probabilidad. Al descartarla quedan solo dos ángulos, y eso es la esfera de Bloch.
      </p>
      <p>
        No confundir con la fase relativa: {l} = ({u} − {d})/√2 no es {r}, porque el signo está entre las amplitudes; en
        cambio −{r} sí es el mismo estado que {r}.
      </p>
      <Disclosure title="Para profundizar: la 3-esfera">
        <p>
          Cuatro números reales con |a<sub>u</sub>|² + |a<sub>d</sub>|² = 1 describen una esfera de tres dimensiones (una
          3-esfera) dentro de un espacio de cuatro. Quitar la fase global identifica los puntos que difieren en un giro
          e<sup>iγ</sup>: cada estado físico es una circunferencia entera de esa 3-esfera, y el conjunto de esas
          circunferencias es la esfera de Bloch ordinaria. Es la fibración de Hopf; para el curso basta con quedarse con
          que sobran dos de los cuatro números.
        </p>
      </Disclosure>
      <h3 className={SECTION_LABEL}>En la esfera</h3>
      <DemoList demos={DEMOS['hilbert-born']} run={run} notation={notation} />
    </Chapter>
  );
}
