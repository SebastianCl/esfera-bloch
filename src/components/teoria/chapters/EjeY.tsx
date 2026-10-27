import { Chapter } from '@/components/teoria/Chapter';
import { Exercise } from '@/components/teoria/Exercise';
import { DemoList } from '@/components/teoria/SphereActions';
import { DEMOS, type ChapterProps } from '@/lib/course';
import { ket } from '@/lib/notation';
import { SECTION_LABEL } from '@/lib/styles';

export function CapituloEjeY({ notation, run }: ChapterProps) {
  const u = ket('zero', notation);
  const d = ket('one', notation);
  const r = ket('plus', notation);
  const l = ket('minus', notation);
  const i = ket('plusI', notation);
  const o = ket('minusI', notation);

  return (
    <Chapter
      slug="eje-y"
      exercise={
        <Exercise
          slug="eje-y"
          run={run}
          notation={notation}
          question={
            <p>
              Un estado con θ = 90° y φ = 90°: visto desde el polo, ¿en qué punto del plano complejo cae y cuánto vale
              e<sup>iφ</sup>? ¿Por qué no cabía en el círculo de Bloch?
            </p>
          }
          answer={
            <>
              <p>
                En +i del plano complejo, sobre el eje +Y: es {i} y e<sup>iφ</sup> = i. El círculo solo tiene los puntos
                +1 y −1 del eje real (fase 0° o 180°); una fase de 90° es imaginaria pura y necesita la segunda dimensión
                del plano de Gauss, es decir, el eje Y de la esfera.
              </p>
              <p>
                Los cuatro estados del ecuador son los puntos cardinales: {r} en +1 (φ = 0°), {i} en +i (90°), {l} en −1
                (180°) y {o} en −i (−90°); todos con θ = 90° y por eso 50 / 50 en Z.
              </p>
            </>
          }
        />
      }
    >
      <p>
        El círculo solo cubre el plano X–Z y pierde la información de la fase imaginaria. Gauss representó cada número
        complejo w = x + iy en un plano: parte real horizontal, parte imaginaria vertical, con +1, −1, +i y −i sobre la
        circunferencia unidad.
      </p>
      <p>
        Aplicado al qubit, la fase relativa e<sup>iφ</sup> que multiplica a {d} es un punto de ese círculo complejo.
        Añadir el eje Y a la figura convierte el círculo en la esfera y permite dibujar los autoestados de S<sub>y</sub>:
      </p>
      <div className="math-formula text-center">
        {i} = ({u} + i{d})/√2, {o} = ({u} − i{d})/√2
      </div>
      <p>
        Si miras la esfera desde el polo {u}, el ecuador se despliega exactamente como el plano complejo: {r} en +1, {l}{' '}
        en −1, {i} en +i y {o} en −i.
      </p>
      <p>
        El momento en que hace falta el eje Y se puede vivir: parte de {r} dentro del círculo y multiplica la amplitud de{' '}
        {d} por i. Eso lo hace la compuerta S, que estudiarás como rotación en el capítulo 7; aquí solo importa que el
        resultado, {i}, no cabe en el plano XZ y la esfera completa se abre sola.
      </p>
      <h3 className={SECTION_LABEL}>En la esfera</h3>
      <DemoList demos={DEMOS['eje-y']} run={run} notation={notation} />
    </Chapter>
  );
}
