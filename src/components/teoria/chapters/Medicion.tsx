import { Link } from 'react-router-dom';
import { Chapter } from '@/components/teoria/Chapter';
import { Exercise } from '@/components/teoria/Exercise';
import { DemoList } from '@/components/teoria/SphereActions';
import { DEMOS, type ChapterProps } from '@/lib/course';
import { ket } from '@/lib/notation';
import { SECTION_LABEL } from '@/lib/styles';

export function CapituloMedicion({ notation, run }: ChapterProps) {
  const u = ket('zero', notation);
  const d = ket('one', notation);
  const r = ket('plus', notation);
  const l = ket('minus', notation);
  const i = ket('plusI', notation);

  return (
    <Chapter
      slug="medicion"
      exercise={
        <Exercise
          slug="medicion"
          run={run}
          notation={notation}
          question={
            <p>
              Dos estados están a 60° en la esfera: {u} y el estado θ = 60°, φ = 0°. Si mides el segundo en la base Z,
              ¿con qué probabilidad obtienes {u}? ¿A qué ángulo tendrían que estar para que esa probabilidad fuera cero?
            </p>
          }
          answer={
            <>
              <p>
                P = cos²(θ<sub>B</sub>/2) = cos²(30°) = 75 %, no «cos 60° = 50 %» ni cero. En general P(+) = (1 + z)/2 y
                aquí z = cos 60° = 0.5; la lectura bajo la esfera lo dice: Z {u} 75.0 %.
              </p>
              <p>
                Para que sea cero hace falta cos(θ<sub>B</sub>/2) = 0, es decir θ<sub>B</sub> = 180°: el único estado
                ortogonal a {u} es su antípoda {d}. A 90° ({r} frente a {u}) el solapamiento es cos²(45°) = ½.
              </p>
            </>
          }
        />
      }
    >
      <p>
        Medir S<sub>z</sub> colapsa el estado a {u} o {d} con probabilidades |a<sub>u</sub>|² y |a<sub>d</sub>|². Pero
        también se puede medir S<sub>x</sub>, S<sub>y</sub> o el espín a lo largo de cualquier eje n̂: la probabilidad del
        autoestado «+» de ese eje es
      </p>
      <div className="math-formula text-center">
        P(+) = (1 + r·n̂)/2 = cos²(θ<sub>B</sub>/2)
      </div>
      <p>
        con θ<sub>B</sub> el ángulo entre la flecha y el autoestado. Por eso la fase importa: {r} e {i} tienen las
        mismas probabilidades en Z (50 / 50), pero en X son certeza y azar respectivamente. La línea de las tres bases
        bajo la esfera es el instrumento de este capítulo;{' '}
        <Link to="/" className="underline-offset-2 hover:underline hover:text-primary">
          el laboratorio muestra además θ<sub>B</sub> con cada autoestado
        </Link>
        .
      </p>
      <p>
        Ángulo y probabilidad: para dos estados cualesquiera, |⟨ψ₁|ψ₂⟩|² = cos²(θ<sub>B</sub>/2). Los estados ortogonales
        ({u} y {d}, {r} y {l}) están en las antípodas, a 180°, y no a 90°: a 90° el solapamiento es ½.
      </p>
      <p>
        Interferencia: parte de {r}, aplica Z (pasa a {l}, con las mismas probabilidades en Z) y luego H: llegas a {d}{' '}
        con certeza. Sin la Z, H lleva {r} a {u}. La fase relativa decidió el resultado al cambiar de base.
      </p>
      <h3 className={SECTION_LABEL}>En la esfera</h3>
      <DemoList demos={DEMOS.medicion} run={run} notation={notation} />
    </Chapter>
  );
}
