import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MatrixView } from '@/components/MatrixView';
import { GATE_ROTATIONS, GATE_UNITARIES, type BlochVector, type KetKey } from '@/lib/bloch';
import { formatComplexExact, formatGlobalPhase } from '@/lib/format';
import { ket, ketExpression, KET_INFO, KET_KEYS, KET_LABELS, type Notation } from '@/lib/notation';
import type { ViewMode } from '@/lib/modes';

interface QuantumEducationProps {
  notation: Notation;
  onSelectMode: (mode: ViewMode) => void;
  onPreset: (preset: KetKey) => void;
}

const degrees = (radians: number) => Math.round((radians * 180) / Math.PI);

/** Subíndice del eje de rotación: x, y, z o n̂ para un eje genérico (el de H). */
const axisSymbol = (axis: BlochVector): string => {
  if (axis.x === 1) return 'x';
  if (axis.y === 1) return 'y';
  if (axis.z === 1) return 'z';
  return 'n̂';
};

export function QuantumEducation({ notation, onSelectMode, onPreset }: QuantumEducationProps) {
  const u = ket('zero', notation);
  const d = ket('one', notation);
  const r = ket('plus', notation);
  const l = ket('minus', notation);
  const i = ket('plusI', notation);
  const o = ket('minusI', notation);

  // Sin Card propia ni título: la tarjeta la pone Index.tsx y el título es la pestaña
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-4">
        Siguiendo las lecciones 30 (<em>Píntame el estado</em>) y 31 (<em>La esfera de Bloch</em>) del curso Mundo
        Cuántico.
      </p>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="phasor">
          <AccordionTrigger className="text-sm text-left">1. Del fasor al estado cuántico</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>
              En ondas clásicas, el fasor resume amplitud y fase de una oscilación como E = E₀ cos(θ) en una flecha que
              gira. La mecánica cuántica necesita una herramienta visual equivalente para los estados de espín y sus
              superposiciones.
            </p>
            <p>
              La esfera de Bloch es esa herramienta: una flecha de longitud 1 cuya dirección codifica el estado completo
              de un qubit.
            </p>
            <p>
              Ojo: la flecha vive en un espacio abstracto de estados, no es la orientación de nada en el espacio físico.
              Girarla 90° no gira la partícula 90°.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="hilbert">
          <AccordionTrigger className="text-sm text-left">2. Espacio de Hilbert y regla de Born</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>Un estado se escribe como combinación lineal de los vectores de la base:</p>
            <div className="math-formula text-center">
              |ψ⟩ = a<sub>u</sub>{u} + a<sub>d</sub>{d}
            </div>
            <p>
              A diferencia de un vector geométrico, en el espacio de Hilbert todo estado físico tiene norma 1. La regla
              de Born convierte las amplitudes en probabilidades:
            </p>
            <div className="math-formula text-center">
              P({u}) = |a<sub>u</sub>|², P({d}) = |a<sub>d</sub>|², |a<sub>u</sub>|² + |a<sub>d</sub>|² = 1
            </div>
            <p>
              Con amplitudes reales esa restricción deja una circunferencia. Con amplitudes complejas, cuatro números
              reales con una ligadura, describe en realidad una 3-esfera. Pero |ψ⟩ y e<sup>iγ</sup>|ψ⟩ son el mismo
              estado físico: la fase global γ no cambia ninguna probabilidad. Al descartarla quedan solo dos ángulos, y
              eso es la esfera de Bloch.
            </p>
            <p>
              No confundir con la fase relativa: {l} = ({u} − {d})/√2 no es {r}, porque el signo está entre las
              amplitudes; en cambio −{r} sí es el mismo estado que {r}.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="circle">
          <AccordionTrigger className="text-sm text-left">3. El círculo de Bloch (lección 30)</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Si a<sub>u</sub> y a<sub>d</sub> son reales, la condición |a<sub>u</sub>|² + |a<sub>d</sub>|² = 1 describe
              una circunferencia de radio 1. Cada estado es una flecha sobre ella, con {u} arriba, {d} abajo y las
              superposiciones {r} y {l} a los lados:
            </p>
            <div className="math-formula text-center">
              {r} = ({u} + {d})/√2, {l} = ({u} − {d})/√2
            </div>
            <p>
              Un solo ángulo α basta: |ψ⟩ = cos(α/2){u} + sin(α/2){d}. Es el fasor de la mecánica cuántica.
            </p>
            <p>
              El par de amplitudes (cos α/2, sin α/2) gira a la mitad de velocidad: una vuelta entera del círculo de
              Bloch (α = 360°) es media vuelta de las amplitudes, que vuelven con el signo cambiado, (−1, 0). Es el −1
              global de la sección anterior: el mismo estado.
            </p>
            <Button size="sm" variant="outline" onClick={() => onSelectMode('circulo')}>
              Ver el círculo de Bloch
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="gauss">
          <AccordionTrigger className="text-sm text-left">4. Gauss, los complejos y el eje Y (lección 31)</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>
              El círculo solo cubre el plano X–Z y pierde la información de la fase imaginaria. Gauss representó cada
              número complejo w = x + iy en un plano: parte real horizontal, parte imaginaria vertical, con +1, −1, +i y
              −i sobre la circunferencia unidad.
            </p>
            <p>
              Aplicado al qubit, la fase relativa e<sup>iφ</sup> que multiplica a {d} es un punto de ese círculo
              complejo. Añadir el eje Y a la figura convierte el círculo en la esfera y permite dibujar los autoestados
              de S<sub>y</sub>:
            </p>
            <div className="math-formula text-center">
              {i} = ({u} + i{d})/√2, {o} = ({u} − i{d})/√2
            </div>
            <p>
              Si miras la esfera desde el polo {u}, el ecuador se despliega exactamente como el plano complejo: {r} en +1,{' '}
              {l} en −1, {i} en +i y {o} en −i.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onSelectMode('polo')}>
                Ver desde el polo
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onPreset('plusI')}>
                Ir a {i}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="eigenstates">
          <AccordionTrigger className="text-sm text-left">5. Los seis autoestados</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Cada eje de la esfera corresponde a un operador de espín. Sus dos autoestados son los puntos opuestos del
              eje. La notación del curso (u, d, r, l, i, o) y la de computación cuántica nombran lo mismo:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-foreground">
                    <th className="py-1 pr-2">Operador</th>
                    <th className="py-1 pr-2">Eje</th>
                    <th className="py-1 pr-2">Curso</th>
                    <th className="py-1 pr-2">Computación</th>
                    <th className="py-1">Expresión</th>
                  </tr>
                </thead>
                <tbody>
                  {KET_KEYS.map((key) => (
                    <tr key={key} className="border-t border-border/40">
                      <td className="py-1 pr-2">
                        S<sub>{KET_INFO[key].operator.slice(1)}</sub>
                      </td>
                      <td className="py-1 pr-2">
                        {KET_INFO[key].axis}
                        {KET_INFO[key].complex && <span className="ml-1 opacity-70">({KET_INFO[key].complex})</span>}
                      </td>
                      <td className="py-1 pr-2 font-mono">
                        <button className="hover:text-primary underline-offset-2 hover:underline" onClick={() => onPreset(key)}>
                          {KET_LABELS.curso[key]}
                        </button>
                      </td>
                      <td className="py-1 pr-2 font-mono">
                        <button className="hover:text-primary underline-offset-2 hover:underline" onClick={() => onPreset(key)}>
                          {KET_LABELS.computacional[key]}
                        </button>
                      </td>
                      <td className="py-1 font-mono">{ketExpression(key, notation)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs">Haz clic en un nombre para llevar el estado hasta él.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="coordinates">
          <AccordionTrigger className="text-sm text-left">6. Coordenadas sobre la esfera</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>La posición de la flecha se describe con dos ángulos:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <Badge variant="outline" className="mr-1">
                  θ
                </Badge>
                polar, de 0 ({u}) a 180° ({d}). Fija las probabilidades en la base Z.
              </li>
              <li>
                <Badge variant="outline" className="mr-1">
                  φ
                </Badge>
                azimutal, de −180° a 180°. Es la fase relativa: gira el estado alrededor del eje Z.
              </li>
            </ul>
            <div className="math-formula text-center mt-2">
              |ψ⟩ = cos(θ/2){u} + e<sup>iφ</sup> sin(θ/2){d}
            </div>
            <p>
              Las coordenadas cartesianas son x = sin θ cos φ, y = sin θ sin φ, z = cos θ. Fíjate en el θ/2: media vuelta
              de la flecha (θ = 180°) intercambia {u} por {d}, no vuelve al mismo estado.
            </p>
            <p>
              Y una vuelta entera (360°) alrededor de cualquier eje devuelve la flecha a su sitio pero multiplica |ψ⟩ por
              −1; hacen falta 720° para recuperar el vector de estado exacto. Es la naturaleza espinorial del qubit: el
              grupo de rotaciones de la esfera, SO(3), está recubierto dos veces por SU(2).
            </p>
            <p>
              Los dos sliders son, salvo fase global, dos rotaciones desde {u}: R<sub>y</sub>(θ) baja la flecha y{' '}
              R<sub>z</sub>(φ) la gira alrededor de Z. Es la descomposición de Euler R<sub>z</sub>·R<sub>y</sub>·R<sub>z</sub>,
              cuya primera rotación no hace nada sobre {u}: con dos ángulos se llega a cualquier estado.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="gates">
          <AccordionTrigger className="text-sm text-left">7. Compuertas como rotaciones</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Toda compuerta de un qubit es, salvo una fase global e<sup>iγ</sup>, una rotación de la esfera alrededor de
              algún eje n̂. Al aplicarla, la esfera muestra el eje y el arco recorrido.
            </p>
            <div className="math-formula text-center text-xs">
              U = e<sup>iγ</sup> R<sub>n̂</sub>(α), R<sub>n̂</sub>(α) = exp(−i α/2 n̂·σ) = cos(α/2) I − i sin(α/2) n̂·σ
            </div>
            <p>
              El ángulo de la esfera es α; en la matriz aparece α/2. La esfera no ve e<sup>iγ</sup>, así que X, Y, Z y H
              son rotaciones de 180° aunque sus matrices no sean exactamente R<sub>n̂</sub>(π).
            </p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-foreground">
                  <th className="py-1 pr-2">Compuerta</th>
                  <th className="py-1 pr-2">Eje</th>
                  <th className="py-1 pr-2">Ángulo</th>
                  <th className="py-1">Efecto</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(GATE_ROTATIONS).map((g) => (
                  <tr key={g.name} className="border-t border-border/40">
                    <td className="py-1 pr-2 font-mono font-bold">{g.name}</td>
                    <td className="py-1 pr-2">{g.axisLabel}</td>
                    <td className="py-1 pr-2">{degrees(g.angle)}°</td>
                    <td className="py-1">
                      {g.name === 'X' && `${u} ↔ ${d}, deja ${r} fijo`}
                      {g.name === 'Y' && `${u} ↔ ${d}, deja ${i} fijo`}
                      {g.name === 'Z' && `${r} ↔ ${l}, deja ${u} fijo`}
                      {g.name === 'H' && `${u} ↔ ${r}, ${d} ↔ ${l}`}
                      {g.name === 'S' && `${r} → ${i} → ${l} → ${o}`}
                      {g.name === 'T' && 'media compuerta S'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              X, Y, Z y H son medias vueltas: aplicadas dos veces devuelven el estado original (como matrices, U² = I). S
              y T solo cambian la fase φ, por eso en el círculo de Bloch no se pueden dibujar.
            </p>
            <p className="text-foreground font-medium">Matrices y fase global</p>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                {Object.keys(GATE_ROTATIONS).map((name) => {
                  const g = GATE_ROTATIONS[name];
                  const unitary = GATE_UNITARIES[name];
                  return (
                    <div key={name} className="rounded-md border border-border/40 bg-muted/40 p-2 space-y-1">
                      <div className="font-mono text-xs text-foreground whitespace-nowrap">
                        {name} = {formatGlobalPhase(unitary.globalPhase)}·R<sub>{axisSymbol(g.axis)}</sub>({degrees(g.angle)}°)
                      </div>
                      <MatrixView matrix={unitary.matrix} format={formatComplexExact} className="text-xs" />
                    </div>
                  );
                })}
              </div>
            </div>
            <p>
              Para H el eje es n̂ = (X+Z)/√2. S y T son compuertas de fase P(φ) = diag(1, e<sup>iφ</sup>) = e<sup>iφ/2</sup>{' '}
              R<sub>z</sub>(φ): Z = P(180°), S = P(90°), T = P(45°).
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="measurement">
          <AccordionTrigger className="text-sm text-left">8. Medición en distintas bases</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Medir S<sub>z</sub> colapsa el estado a {u} o {d} con probabilidades |a<sub>u</sub>|² y |a<sub>d</sub>|².
              Pero también se puede medir S<sub>x</sub> o S<sub>y</sub>: la probabilidad del autoestado "+" de un eje es
              (1 + componente del vector en ese eje)/2.
            </p>
            <p>
              Por eso la fase importa: {r} y {i} tienen las mismas probabilidades en Z (50/50), pero en X son
              certeza y azar respectivamente. El panel de la izquierda muestra las tres bases a la vez.
            </p>
            <p>
              Ángulo y probabilidad: para dos estados cualesquiera, |⟨ψ₁|ψ₂⟩|² = cos²(θ<sub>B</sub>/2), con{' '}
              θ<sub>B</sub> el ángulo entre sus flechas. Los estados ortogonales ({u} y {d}, {r} y {l}) están en las
              antípodas, a 180°, y no a 90°: a 90° el solapamiento es ½. El panel de la izquierda muestra ese ángulo con
              cada autoestado.
            </p>
            <p>
              Interferencia: parte de {r}, aplica Z (pasa a {l}, con las mismas probabilidades en Z) y luego H: llegas a{' '}
              {d} con certeza. La fase relativa decidió el resultado al cambiar de base.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="density">
          <AccordionTrigger className="text-sm text-left">9. La matriz de densidad y el interior de la esfera</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Otra forma de escribir el mismo estado es la matriz de densidad ρ = |ψ⟩⟨ψ|. Para un qubit siempre se
              puede escribir con el vector de Bloch r = (x, y, z) y las matrices de Pauli:
            </p>
            <div className="math-formula text-center text-xs">
              ρ = ½(I + x σ<sub>x</sub> + y σ<sub>y</sub> + z σ<sub>z</sub>) = ½ [[1+z, x−iy], [x+iy, 1−z]]
            </div>
            <p>
              Las compuertas actúan como ρ′ = UρU<sup>†</sup>, y la fase global desaparece sola. La diagonal son las
              probabilidades en Z; fuera de la diagonal están las coherencias, que dependen de la fase.
            </p>
            <p>
              Lo nuevo es que ρ también describe estados que no son superposiciones puras sino mezclas estadísticas:
              entonces |r| &lt; 1 y el punto queda dentro de la esfera. La pureza Tr(ρ²) = (1 + |r|²)/2 vale 1 en la
              superficie (estado puro: dos grados de libertad, θ y φ) y ½ en el centro, ρ = I/2, donde no se sabe nada
              del qubit (tres grados de libertad: también la longitud). La decoherencia y el entrelazamiento con otro
              sistema acortan la flecha hacia el centro. Esta app solo muestra estados puros: el panel de la izquierda
              enseña ρ y su pureza, siempre 1.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
