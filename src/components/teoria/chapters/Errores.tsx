import { Link } from 'react-router-dom';
import { MatrixView } from '@/components/MatrixView';
import { Chapter } from '@/components/teoria/Chapter';
import { Exercise } from '@/components/teoria/Exercise';
import { DemoList } from '@/components/teoria/SphereActions';
import { complex, type Matrix2 } from '@/lib/complex';
import { DEMOS, type ChapterProps } from '@/lib/course';
import { formatComplex } from '@/lib/format';
import { ket } from '@/lib/notation';
import { SECTION_LABEL } from '@/lib/styles';

const HALF_IDENTITY: Matrix2 = [
  [complex(0.5), complex(0)],
  [complex(0), complex(0.5)],
];

const OVERLAP_TABLE: [number, number][] = [
  [0, 100],
  [60, 75],
  [90, 50],
  [120, 25],
  [180, 0],
];

export function CapituloErrores({ notation, run }: ChapterProps) {
  const u = ket('zero', notation);
  const d = ket('one', notation);
  const r = ket('plus', notation);
  const l = ket('minus', notation);
  const demos = DEMOS.errores;

  return (
    <Chapter
      slug="errores"
      exercise={
        <Exercise
          slug="errores"
          run={run}
          notation={notation}
          question={
            <>
              <p>Verdadero o falso, y por qué:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  {u} y {r} son ortogonales porque forman 90°.
                </li>
                <li>Aplicar X a un electrón en {u} le da la vuelta como a una carga clásica, con un espín definido en todas las direcciones.</li>
                <li>
                  {l} y −{r} son el mismo estado.
                </li>
                <li>Un qubit entrelazado con otro se dibuja en algún punto de la superficie de su esfera.</li>
              </ol>
            </>
          }
          answer={
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Falso: ⟨{u}|{r}⟩ = 1/√2 y |⟨{u}|{r}⟩|² = ½; ortogonal es la antípoda, a 180° ({u} y {d}, {r} y {l}).
              </li>
              <li>
                Falso: en {u} la lectura da Z 100 / 0 pero X 50 / 50 e Y 50 / 50. La polarización solo está definida a lo
                largo de un eje; una carga clásica con vector de espín tendría valor definido en los tres. Lo que X
                invierte es ese eje de certeza, y lo que se mide son probabilidades: P({u}) pasa de 100 % a 0 %.
              </li>
              <li>
                Falso: −{r} = −({u} + {d})/√2 tiene el signo en las dos amplitudes (fase global, el mismo punto +X),
                mientras que {l} = ({u} − {d})/√2 lo tiene solo en una (fase relativa, el punto −X); Z y luego H los
                distingue.
              </li>
              <li>
                Falso: su matriz de densidad reducida es ½I, |r| = 0, el centro de la esfera; la app solo dibuja estados
                puros y por eso no puede mostrarlo.
              </li>
            </ol>
          }
        />
      }
    >
      <p>
        Cuatro errores frecuentes al leer la esfera, cada uno con cómo se nota, la corrección y una comprobación. Son un
        repaso de los capítulos 1, 2, 3, 8 y 9.
      </p>

      <h3 className={SECTION_LABEL}>Error 1 · «A 90° son ortogonales»</h3>
      <p>
        <strong>Cómo se nota:</strong> extraña que {u} y {d} estén en polos opuestos y no a 90°, como dos ejes
        perpendiculares. <strong>Corrección:</strong> el ángulo de Hilbert es la mitad del de la esfera. Ortogonal es
        antípoda (180°); a 90° el solapamiento es ½. La tabla θ<sub>B</sub> → P = cos²(θ<sub>B</sub>/2):
      </p>
      <table className="w-full max-w-xs text-xs">
        <thead>
          <tr className="text-left text-foreground">
            <th className="py-1 pr-2">
              θ<sub>B</sub>
            </th>
            <th className="py-1">P({u})</th>
          </tr>
        </thead>
        <tbody>
          {OVERLAP_TABLE.map(([angle, p]) => (
            <tr key={angle} className="border-t border-border/40 font-mono tabular-nums">
              <td className="py-1 pr-2">{angle}°</td>
              <td className="py-1">{p} %</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <strong>Compruébalo:</strong> recorre θ<sub>B</sub> desde {u} leyendo P({u}) en cada parada.
      </p>
      <DemoList demos={demos.slice(0, 3)} run={run} notation={notation} />

      <h3 className={SECTION_LABEL}>Error 2 · «La flecha es una carga girando»</h3>
      <p>
        <strong>Cómo se nota:</strong> se lee la rotación de la flecha como la de una peonza en el espacio, con un espín
        que vale algo en todas las direcciones a la vez. <strong>Corrección:</strong> para un espín ½ la flecha sí es la
        polarización, el eje a lo largo del cual una medida da «+» con certeza, pero solo a lo largo de ese eje: en {u}{' '}
        X e Y dan 50 / 50. Lo que X invierte es ese eje, y lo que se mide son probabilidades: P({u}) pasa de 100 % a 0 %.
        Para otros qubits (fotones, circuitos) la flecha ni siquiera es una dirección del laboratorio.
      </p>
      <DemoList demos={demos.slice(3, 4)} run={run} notation={notation} />

      <h3 className={SECTION_LABEL}>Error 3 · «El signo de {l} da igual»</h3>
      <p>
        <strong>Cómo se nota:</strong> se supone que una rotación alrededor de Z «no cambia nada» porque Z sigue dando
        50 / 50. <strong>Corrección:</strong> el signo entre las amplitudes es una fase relativa: {r} está en +X y {l} en
        −X, y una medida en X los distingue con certeza. Solo el signo que multiplica a todo el estado (−{r}) es global.{' '}
        <strong>Compruébalo:</strong> mira la fila X con {r} y con {l}; después Z y luego H llevan {r} a {d} con certeza,
        mientras que H sola lo lleva a {u}.
      </p>
      <DemoList demos={demos.slice(4)} run={run} notation={notation} />

      <h3 className={SECTION_LABEL}>Error 4 · «Varios qubits, cada uno con su flecha en la superficie»</h3>
      <p>
        <strong>Cómo se nota:</strong> se dibuja un qubit entrelazado como una flecha pura sobre la esfera.{' '}
        <strong>Corrección:</strong> para un par entrelazado como |Φ⁺⟩, la matriz de densidad reducida de cada qubit es
        ½I: |r| = 0, el centro de la esfera, Tr ρ² = ½. El entrelazamiento destruye la pureza local, y acortarse hacia el
        centro es su huella visible. Esta app solo dibuja estados puros, así que no puede mostrarlo; el{' '}
        <Link to="/teoria/densidad" className="underline-offset-2 hover:underline hover:text-primary">
          capítulo 9
        </Link>{' '}
        explica el interior.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-md border border-border/40 bg-muted/40 p-2">
        <span className="text-xs text-muted-foreground">ρ = ½I = [[0.5, 0], [0, 0.5]], Tr ρ² = ½:</span>
        <MatrixView matrix={HALF_IDENTITY} format={formatComplex} className="text-xs" />
      </div>
    </Chapter>
  );
}
