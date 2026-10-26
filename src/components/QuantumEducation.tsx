import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GATE_ROTATIONS, type KetKey } from '@/lib/bloch';
import { ket, KET_INFO, KET_KEYS, KET_LABELS, type Notation } from '@/lib/notation';
import type { ViewMode } from '@/lib/modes';

interface QuantumEducationProps {
  notation: Notation;
  onSelectMode: (mode: ViewMode) => void;
  onPreset: (preset: KetKey) => void;
}

const degrees = (radians: number) => Math.round((radians * 180) / Math.PI);

/** Expresión de cada autoestado en la base Z, con la notación elegida. */
const expression = (key: KetKey, notation: Notation): string => {
  const u = ket('zero', notation);
  const d = ket('one', notation);
  switch (key) {
    case 'zero':
      return u;
    case 'one':
      return d;
    case 'plus':
      return `(${u} + ${d})/√2`;
    case 'minus':
      return `(${u} − ${d})/√2`;
    case 'plusI':
      return `(${u} + i${d})/√2`;
    case 'minusI':
      return `(${u} − i${d})/√2`;
  }
};

export function QuantumEducation({ notation, onSelectMode, onPreset }: QuantumEducationProps) {
  const u = ket('zero', notation);
  const d = ket('one', notation);
  const r = ket('plus', notation);
  const l = ket('minus', notation);
  const i = ket('plusI', notation);
  const o = ket('minusI', notation);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-1 text-primary">Teoría</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Siguiendo las lecciones 30 (<em>Píntame el estado</em>) y 31 (<em>La esfera de Bloch</em>) del curso Mundo
        Cuántico.
      </p>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="phasor">
          <AccordionTrigger className="text-sm">1. Del fasor al estado cuántico</AccordionTrigger>
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="hilbert">
          <AccordionTrigger className="text-sm">2. Espacio de Hilbert y regla de Born</AccordionTrigger>
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
              Esa restricción es la que obliga a los estados a vivir sobre una circunferencia (amplitudes reales) o sobre
              una esfera (amplitudes complejas), nunca en todo el plano.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="circle">
          <AccordionTrigger className="text-sm">3. El círculo de Bloch (lección 30)</AccordionTrigger>
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
            <Button size="sm" variant="outline" onClick={() => onSelectMode('circulo')}>
              Ver el círculo de Bloch
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="gauss">
          <AccordionTrigger className="text-sm">4. Gauss, los complejos y el eje Y (lección 31)</AccordionTrigger>
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
          <AccordionTrigger className="text-sm">5. Los seis autoestados</AccordionTrigger>
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
                      <td className="py-1 font-mono">{expression(key, notation)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs">Haz clic en un nombre para llevar el estado hasta él.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="coordinates">
          <AccordionTrigger className="text-sm">6. Coordenadas sobre la esfera</AccordionTrigger>
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
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="gates">
          <AccordionTrigger className="text-sm">7. Compuertas como rotaciones</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Toda compuerta de un qubit es una rotación de la esfera alrededor de algún eje. Al aplicarla, la esfera
              muestra el eje y el arco recorrido.
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
              X, Y, Z y H son medias vueltas: aplicadas dos veces devuelven el estado original. S y T solo cambian la fase
              φ, por eso en el círculo de Bloch no se pueden dibujar.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="measurement">
          <AccordionTrigger className="text-sm">8. Medición en distintas bases</AccordionTrigger>
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
