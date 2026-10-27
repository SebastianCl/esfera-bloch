import { GateTable } from '@/components/GateTable';
import { Chapter } from '@/components/teoria/Chapter';
import { Disclosure } from '@/components/teoria/Disclosure';
import { Exercise } from '@/components/teoria/Exercise';
import { DemoList } from '@/components/teoria/SphereActions';
import { DEMOS, type ChapterProps } from '@/lib/course';
import { ket } from '@/lib/notation';
import { SECTION_LABEL } from '@/lib/styles';

export function CapituloCompuertas({ notation, run }: ChapterProps) {
  const u = ket('zero', notation);
  const r = ket('plus', notation);
  const l = ket('minus', notation);
  const i = ket('plusI', notation);

  return (
    <Chapter
      slug="compuertas"
      exercise={
        <Exercise
          slug="compuertas"
          run={run}
          notation={notation}
          question={
            <p>
              Parte de {u} y aplica H. ¿A dónde llega y por qué? Desde ahí, ¿qué compuerta de un solo paso te lleva a {i}{' '}
              y cuál a {l}? ¿Hay alguna que deje ese estado quieto?
            </p>
          }
          answer={
            <>
              <p>
                H gira 180° alrededor del eje (X+Z)/√2, que está a 45° entre {u} y {r}, así que intercambia el polo norte
                con +X: H{u} = {r}. Desde {r}, S (90° alrededor de Z) lleva a {i} y Z (180° alrededor de Z) lleva a {l};
                también Y (180° alrededor de Y) lleva {r} a {l}, pero pasando por el polo.
              </p>
              <p>X deja {r} quieto porque {r} está sobre el eje X: un estado situado sobre el eje de giro no se mueve.</p>
            </>
          }
        />
      }
    >
      <p>
        Toda compuerta de un qubit es, salvo una fase global e<sup>iγ</sup>, una rotación de la esfera alrededor de
        algún eje n̂. Al aplicarla, la esfera muestra el eje y el arco recorrido.
      </p>
      <div className="math-formula text-center text-xs">
        U = e<sup>iγ</sup> R<sub>n̂</sub>(α), R<sub>n̂</sub>(α) = exp(−i α/2 n̂·σ) = cos(α/2) I − i sin(α/2) n̂·σ
      </div>
      <p>
        La esfera no ve e<sup>iγ</sup>, así que X, Y, Z y H son rotaciones de 180° aunque sus matrices no sean
        exactamente R<sub>n̂</sub>(π). Pulsa el nombre de una compuerta para aplicarla al estado actual:
      </p>
      <GateTable notation={notation} onGate={(g) => run({ type: 'gate', gate: g })} gridClassName="grid-cols-2" />
      <p>
        X, Y, Z y H son medias vueltas: aplicadas dos veces devuelven el estado original (como matrices, U² = I). S y T
        solo cambian la fase φ: sacan del círculo de Bloch a cualquier estado que no esté en un polo, como viste en el
        capítulo 4.
      </p>
      <Disclosure title="Para profundizar: Rodrigues, compuertas de fase y Euler">
        <p>
          Sobre el vector de Bloch, R<sub>n̂</sub>(α) es la fórmula de rotación de Rodrigues: r′ = r cos α + (n̂ × r) sin α
          + n̂ (n̂·r)(1 − cos α). Es lo que la esfera anima; la matriz hace lo mismo sobre las amplitudes con α/2.
        </p>
        <p>
          Para H el eje es n̂ = (X+Z)/√2. S y T son compuertas de fase P(φ) = diag(1, e<sup>iφ</sup>) = e<sup>iφ/2</sup>{' '}
          R<sub>z</sub>(φ): Z = P(180°), S = P(90°), T = P(45°).
        </p>
        <p>
          Cualquier rotación se escribe como R<sub>z</sub>(α) R<sub>y</sub>(β) R<sub>z</sub>(γ) (descomposición de Euler
          ZYZ): con tres giros alrededor de dos ejes se construye cualquier compuerta de un qubit.
        </p>
      </Disclosure>
      <h3 className={SECTION_LABEL}>En la esfera</h3>
      <DemoList demos={DEMOS.compuertas} run={run} notation={notation} />
    </Chapter>
  );
}
