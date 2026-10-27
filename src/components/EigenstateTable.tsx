import { KET_INFO, KET_KEYS, KET_LABELS, ket, ketExpression, type Notation } from '@/lib/notation';
import type { KetKey } from '@/lib/bloch';

interface EigenstateTableProps {
  notation: Notation;
  /** Clic en un nombre: llevar la esfera a ese autoestado. */
  onPreset: (key: KetKey) => void;
}

const NAME_BUTTON =
  'hover:text-primary underline-offset-2 hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * Los seis autoestados con su operador, eje, nombre en las dos notaciones y
 * expresión en la base Z. La comparten la guía rápida y el capítulo 5 del curso.
 */
export function EigenstateTable({ notation, onPreset }: EigenstateTableProps) {
  return (
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
                <button className={NAME_BUTTON} aria-label={`Ir al estado ${ket(key, notation)}`} onClick={() => onPreset(key)}>
                  {KET_LABELS.curso[key]}
                </button>
              </td>
              <td className="py-1 pr-2 font-mono">
                <button className={NAME_BUTTON} aria-label={`Ir al estado ${ket(key, notation)}`} onClick={() => onPreset(key)}>
                  {KET_LABELS.computacional[key]}
                </button>
              </td>
              <td className="py-1 font-mono">{ketExpression(key, notation)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
