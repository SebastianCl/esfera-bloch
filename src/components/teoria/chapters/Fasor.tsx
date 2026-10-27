import { Callout } from '@/components/teoria/Callout';
import { Chapter } from '@/components/teoria/Chapter';
import { Exercise } from '@/components/teoria/Exercise';
import { DemoList } from '@/components/teoria/SphereActions';
import { DEMOS, type ChapterProps } from '@/lib/course';
import { ket } from '@/lib/notation';
import { SECTION_LABEL } from '@/lib/styles';

export function CapituloFasor({ notation, run }: ChapterProps) {
  const u = ket('zero', notation);
  const d = ket('one', notation);
  const r = ket('plus', notation);

  return (
    <Chapter
      slug="fasor"
      exercise={
        <Exercise
          slug="fasor"
          run={run}
          notation={notation}
          question={
            <p>
              La flecha apunta a {u} y la llevas a {r}, que está a 90°. ¿Qué ha girado 90°: la partícula, algo medible, o
              nada? ¿Y qué le pasa a la longitud de la flecha?
            </p>
          }
          answer={
            <>
              <p>
                La partícula no gira como una peonza y la flecha no es una carga dando vueltas. Pero su dirección sí
                tiene significado físico: es la polarización del espín, el eje del laboratorio a lo largo del cual una
                medida da «+» con certeza. Léelo bajo la esfera: en {u}, Z da {u} al 100 %; en {r}, X da {r} al 100 % y Z
                queda al 50 / 50.
              </p>
              <p>
                La longitud no cambia: todo estado puro mide 1 y no lleva información. Lo abstracto es el espacio de
                Hilbert, donde el ángulo es la mitad: 90° en la esfera no es «ortogonal» (capítulos 3 y 8).
              </p>
            </>
          }
        />
      }
    >
      <p>
        En ondas clásicas, el fasor resume amplitud y fase de una oscilación como E = E₀ cos(θ) en una flecha que gira.
        La mecánica cuántica necesita una herramienta visual equivalente para los estados de espín y sus superposiciones.
      </p>
      <p>
        La esfera de Bloch es esa herramienta: una flecha de longitud 1 cuya dirección codifica el estado completo de un
        qubit. Hilbert aportó el espacio de estados, Bloch la geometría de los sistemas de dos niveles, Gauss el plano
        complejo que hará falta en el capítulo 4 y von Neumann el formalismo que los une.
      </p>
      <p>
        Dos cosas se ven ya en la esfera: la flecha siempre mide 1 (un estado aleatorio cambia de dirección, nunca de
        tamaño) y {u} está en el polo norte con {d} en el polo sur: los dos resultados de medir el espín en Z son los dos
        extremos de un mismo eje.
      </p>
      <Callout label="Ojo">
        <p>
          Para un espín ½, el qubit de las lecciones, la flecha sí es una dirección del laboratorio: la polarización del
          espín, el eje a lo largo del cual una medida da «+» con certeza. El error está en imaginar una carga clásica
          girando, con un valor definido del espín en todas las direcciones a la vez, y en confundir el ángulo de la
          esfera con el del espacio de Hilbert, que es la mitad. Para otros qubits (la polarización de un fotón, un
          circuito superconductor) la flecha es solo una dirección en el espacio de estados.
        </p>
      </Callout>
      <h3 className={SECTION_LABEL}>En la esfera</h3>
      <DemoList demos={DEMOS.fasor} run={run} notation={notation} />
    </Chapter>
  );
}
