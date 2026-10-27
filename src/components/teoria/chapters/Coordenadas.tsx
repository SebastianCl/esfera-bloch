import { Link } from 'react-router-dom';
import { AnglesSummary } from '@/components/AnglesSummary';
import { Chapter } from '@/components/teoria/Chapter';
import { Disclosure } from '@/components/teoria/Disclosure';
import { Exercise } from '@/components/teoria/Exercise';
import { DemoList } from '@/components/teoria/SphereActions';
import { isPole, toBlochVector } from '@/lib/bloch';
import { DEMOS, type ChapterProps } from '@/lib/course';
import { ket } from '@/lib/notation';
import { SECTION_LABEL } from '@/lib/styles';

const degrees = (radians: number) => ((radians * 180) / Math.PI).toFixed(1);

export function CapituloCoordenadas({ notation, state, run }: ChapterProps) {
  const u = ket('zero', notation);
  const d = ket('one', notation);
  const i = ket('plusI', notation);
  const o = ket('minusI', notation);
  const v = toBlochVector(state.theta, state.phi);

  return (
    <Chapter
      slug="coordenadas"
      exercise={
        <Exercise
          slug="coordenadas"
          run={run}
          notation={notation}
          question={
            <p>
              Un estado tiene θ = 120° y φ = 90°. ¿En qué hemisferio está y hacia qué eje apunta? ¿Cuáles son sus
              probabilidades en la base Z? ¿Qué cambia si pones φ = −90°?
            </p>
          }
          answer={
            <>
              <p>
                θ = 120° &gt; 90°: hemisferio sur, más cerca de {d}; φ = 90°: visto desde arriba apunta hacia +Y, del lado
                de {i}. Coordenadas x = sin 120° cos 90° = 0, y = sin 120° ≈ 0.866, z = cos 120° = −0.5. P({u}) = cos²(60°)
                = 25 % y P({d}) = 75 %.
              </p>
              <p>
                Con φ = −90° el punto pasa al lado de {o} (y ≈ −0.866) pero θ no cambia, así que Z sigue en 25 % / 75 %:
                la fase relativa no se ve en la base Z, pero en Y pasa de 93.3 % / 6.7 % a 6.7 % / 93.3 %.
              </p>
            </>
          }
        />
      }
    >
      <AnglesSummary notation={notation} />
      <p className="text-xs text-muted-foreground">
        Ahora mismo: θ = <span className="font-mono tabular-nums">{degrees(state.theta)}°</span>, φ ={' '}
        <span className="font-mono tabular-nums">{isPole(state.theta) ? 'indefinida' : `${degrees(state.phi)}°`}</span>,
        r = (
        <span className="font-mono tabular-nums">
          {v.x.toFixed(3)}, {v.y.toFixed(3)}, {v.z.toFixed(3)}
        </span>
        ). <Link to="/" className="underline-offset-2 hover:underline hover:text-primary">Ajusta θ y φ con los sliders del laboratorio.</Link>
      </p>
      <p>
        En los polos φ no está definida: con una sola amplitud la fase que la multiplica es global, y la lectura
        escribe «φ indef.». Fíjate en el θ/2 de la fórmula: media vuelta de la flecha (θ = 180°) intercambia {u} por{' '}
        {d}, no vuelve al mismo estado.
      </p>
      <Disclosure title="Para profundizar: 720° y la descomposición de Euler">
        <p>
          Una vuelta entera (360°) alrededor de cualquier eje devuelve la flecha a su sitio pero multiplica |ψ⟩ por −1;
          hacen falta 720° para recuperar el vector de estado exacto. Es la naturaleza espinorial del qubit: el grupo de
          rotaciones de la esfera, SO(3), está recubierto dos veces por SU(2). Como la app fija la fase global, ese −1 es
          invisible por definición.
        </p>
        <p>
          Los dos ángulos son, salvo fase global, dos rotaciones desde {u}: R<sub>y</sub>(θ) baja la flecha y
          R<sub>z</sub>(φ) la gira alrededor de Z. Es la descomposición de Euler R<sub>z</sub>·R<sub>y</sub>·R<sub>z</sub>,
          cuya primera rotación no hace nada sobre {u}: con dos ángulos se llega a cualquier estado.
        </p>
      </Disclosure>
      <h3 className={SECTION_LABEL}>En la esfera</h3>
      <DemoList demos={DEMOS.coordenadas} run={run} notation={notation} />
    </Chapter>
  );
}
