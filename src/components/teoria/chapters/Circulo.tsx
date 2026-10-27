import { Callout } from '@/components/teoria/Callout';
import { Chapter } from '@/components/teoria/Chapter';
import { Exercise } from '@/components/teoria/Exercise';
import { DemoList } from '@/components/teoria/SphereActions';
import { DEMOS, type ChapterProps } from '@/lib/course';
import { ket } from '@/lib/notation';
import { SECTION_LABEL } from '@/lib/styles';

export function CapituloCirculo({ notation, run }: ChapterProps) {
  const u = ket('zero', notation);
  const d = ket('one', notation);
  const r = ket('plus', notation);
  const l = ket('minus', notation);

  return (
    <Chapter
      slug="circulo"
      exercise={
        <Exercise
          slug="circulo"
          run={run}
          notation={notation}
          question={
            <p>
              Un estado del círculo está a α = 60° de {u}, hacia {r}. Escribe sus amplitudes y las probabilidades de
              medir S<sub>z</sub>. ¿A qué α está el estado ortogonal a {u}?
            </p>
          }
          answer={
            <>
              <p>
                |ψ⟩ = cos 30° {u} + sin 30° {d} ≈ 0.866 {u} + 0.500 {d}, así que P({u}) = cos² 30° = 0.75 y P({d}) = 0.25.
                En la figura el ángulo es 60°, pero en las amplitudes entra 30°, la mitad.
              </p>
              <p>
                El ortogonal a {u} necesita cos(α/2) = 0, es decir α = 180°: {d}, el punto opuesto, no el que está a 90°
                (ese es {r}, con P({u}) = ½).
              </p>
            </>
          }
        />
      }
    >
      <p>
        Si a<sub>u</sub> y a<sub>d</sub> son reales, la condición |a<sub>u</sub>|² + |a<sub>d</sub>|² = 1 describe una
        circunferencia de radio 1. Cada estado es una flecha sobre ella, con {u} arriba, {d} abajo y las superposiciones{' '}
        {r} y {l} a los lados:
      </p>
      <div className="math-formula text-center">
        {r} = ({u} + {d})/√2, {l} = ({u} − {d})/√2
      </div>
      <p>
        Un solo ángulo α basta: |ψ⟩ = cos(α/2){u} + sin(α/2){d}. Es el fasor de la mecánica cuántica. α = 90° es {r} y
        α = 270° es {l}.
      </p>
      <p>
        El par de amplitudes (cos α/2, sin α/2) gira a la mitad de velocidad que la flecha. Al pasar de α = 180° la
        fórmula del círculo da las amplitudes con el signo cambiado: en α = 270° escribe −(1/√2){u} + (1/√2){d}, que es{' '}
        {l} multiplicado por −1. Es el −1 global del capítulo 2: el mismo estado, y la lectura bajo la esfera lo avisa.
      </p>
      <Callout label="Ojo">
        <p>
          {u} y {d} son ortogonales y están a 180° en el círculo, no a 90°. A 90° está {r}, que tiene la mitad de
          probabilidad de dar {u}. Los capítulos 8 y 10 ponen número a esto: P = cos²(θ<sub>B</sub>/2).
        </p>
      </Callout>
      <h3 className={SECTION_LABEL}>En la esfera</h3>
      <p className="text-xs text-muted-foreground">
        En modo círculo la esfera oculta el eje Y y resalta el anillo XZ; la lectura añade α y la fórmula del círculo.
      </p>
      <DemoList demos={DEMOS.circulo} run={run} notation={notation} />
    </Chapter>
  );
}
