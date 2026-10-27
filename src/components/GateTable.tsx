import { MatrixView } from '@/components/MatrixView';
import { GATE_ROTATIONS, GATE_UNITARIES, type BlochVector } from '@/lib/bloch';
import { formatComplexExact, formatGlobalPhase } from '@/lib/format';
import { ket, type Notation } from '@/lib/notation';
import { cn } from '@/lib/utils';

interface GateTableProps {
  notation: Notation;
  /** Clic en el nombre de una compuerta: aplicarla a la esfera. */
  onGate: (gate: string) => void;
  /**
   * Clases de la rejilla de matrices. Por defecto, las de la tarjeta estrecha del
   * laboratorio (una columna en lg); el curso, con columna ancha, pasa dos columnas.
   */
  gridClassName?: string;
}

const degrees = (radians: number) => Math.round((radians * 180) / Math.PI);

/** Subíndice del eje de rotación: x, y, z o n̂ para un eje genérico (el de H). */
const axisSymbol = (axis: BlochVector): string => {
  if (axis.x === 1) return 'x';
  if (axis.y === 1) return 'y';
  if (axis.z === 1) return 'z';
  return 'n̂';
};

/**
 * Las compuertas como rotaciones: eje, ángulo y efecto sobre los autoestados, y
 * debajo las matrices con su fase global. La comparten la guía rápida y el
 * capítulo 7 del curso. La rejilla va debajo de la tabla, no en una columna,
 * porque la tarjeta derecha del laboratorio es estrecha en lg.
 */
export function GateTable({ notation, onGate, gridClassName = 'grid-cols-2 lg:grid-cols-1 xl:grid-cols-2' }: GateTableProps) {
  const u = ket('zero', notation);
  const d = ket('one', notation);
  const r = ket('plus', notation);
  const l = ket('minus', notation);
  const i = ket('plusI', notation);
  const o = ket('minusI', notation);

  const effect: Record<string, string> = {
    X: `${u} ↔ ${d}, deja ${r} fijo`,
    Y: `${u} ↔ ${d}, deja ${i} fijo`,
    Z: `${r} ↔ ${l}, deja ${u} fijo`,
    H: `${u} ↔ ${r}, ${d} ↔ ${l}`,
    S: `${r} → ${i} → ${l} → ${o}`,
    T: 'media compuerta S',
  };

  return (
    <div className="space-y-2">
      <div className="math-formula text-center text-xs">
        U = e<sup>iγ</sup> R<sub>n̂</sub>(α): el ángulo de la esfera es α, en la matriz aparece α/2
      </div>
      <div className="overflow-x-auto">
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
                <td className="py-1 pr-2 font-mono font-bold">
                  <button
                    className="hover:text-primary underline-offset-2 hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Aplicar la compuerta ${g.name}`}
                    onClick={() => onGate(g.name)}
                  >
                    {g.name}
                  </button>
                </td>
                <td className="py-1 pr-2">{g.axisLabel}</td>
                <td className="py-1 pr-2">{degrees(g.angle)}°</td>
                <td className="py-1">{effect[g.name] ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm font-medium text-foreground">Matrices y fase global</p>
      <div className="overflow-x-auto">
        <div className={cn('grid gap-2', gridClassName)}>
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
    </div>
  );
}
