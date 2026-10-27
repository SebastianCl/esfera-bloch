import { MatrixView } from '@/components/MatrixView';
import { Chapter } from '@/components/teoria/Chapter';
import { Exercise } from '@/components/teoria/Exercise';
import { DemoList } from '@/components/teoria/SphereActions';
import { densityMatrix, purity, toBlochVector } from '@/lib/bloch';
import { DEMOS, type ChapterProps } from '@/lib/course';
import { formatComplex } from '@/lib/format';
import { ket } from '@/lib/notation';
import { SECTION_LABEL } from '@/lib/styles';

export function CapituloDensidad({ notation, state, run }: ChapterProps) {
  const u = ket('zero', notation);
  const d = ket('one', notation);
  const i = ket('plusI', notation);
  const o = ket('minusI', notation);
  const v = toBlochVector(state.theta, state.phi);

  return (
    <Chapter
      slug="densidad"
      exercise={
        <Exercise
          slug="densidad"
          run={run}
          notation={notation}
          question={
            <p>
              Escribe la matriz de densidad de {i} = ({u} + i{d})/√2. ¿Qué parte de ella cambiaría si el estado fuera{' '}
              {o}? ¿Y cuánto vale Tr ρ² en los dos casos?
            </p>
          }
          answer={
            <>
              <p>
                {i} tiene r = (0, 1, 0), así que ρ = ½[[1, −i], [i, 1]]. Para {o}, r = (0, −1, 0) y ρ = ½[[1, i], [−i, 1]].
                Solo cambian las coherencias (fuera de la diagonal), que llevan la fase; la diagonal (½, ½) es la misma
                porque ambos dan 50 / 50 en Z.
              </p>
              <p>
                En los dos casos |r| = 1 y Tr ρ² = 1: estados puros, sobre la superficie. Un qubit en el centro tendría
                ρ = ½I y Tr ρ² = ½ (capítulo 10, error 4).
              </p>
            </>
          }
        />
      }
    >
      <p>
        Otra forma de escribir el mismo estado es la matriz de densidad ρ = |ψ⟩⟨ψ|. Para un qubit siempre se puede
        escribir con el vector de Bloch r = (x, y, z) y las matrices de Pauli:
      </p>
      <div className="math-formula text-center text-xs">
        ρ = ½(I + x σ<sub>x</sub> + y σ<sub>y</sub> + z σ<sub>z</sub>) = ½ [[1+z, x−iy], [x+iy, 1−z]]
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-md border border-border/40 bg-muted/40 p-2">
        <span className="text-xs text-muted-foreground">ρ del estado actual:</span>
        <MatrixView matrix={densityMatrix(v)} format={formatComplex} className="text-xs" />
        <span className="text-xs text-muted-foreground">
          Tr ρ² = <span className="font-mono tabular-nums">{purity(v).toFixed(3)}</span>
        </span>
      </div>
      <p>
        Las compuertas actúan como ρ′ = UρU<sup>†</sup>, y la fase global desaparece sola. La diagonal son las
        probabilidades en Z; fuera de la diagonal están las coherencias, que dependen de la fase.
      </p>
      <p>
        Lo nuevo es que ρ también describe estados que no son superposiciones puras sino mezclas estadísticas: entonces
        |r| &lt; 1 y el punto queda dentro de la esfera. La pureza Tr ρ² = (1 + |r|²)/2 vale 1 en la superficie (estado
        puro: dos grados de libertad, θ y φ) y ½ en el centro, ρ = I/2, donde no se sabe nada del qubit (tres grados de
        libertad: también la longitud). La decoherencia y el entrelazamiento con otro sistema acortan la flecha hacia el
        centro. Esta app solo dibuja estados puros: la pureza que ves es siempre 1.
      </p>
      <h3 className={SECTION_LABEL}>En la esfera</h3>
      <DemoList demos={DEMOS.densidad} run={run} notation={notation} />
    </Chapter>
  );
}
