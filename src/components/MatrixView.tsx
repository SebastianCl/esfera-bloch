import type { Complex, Matrix2 } from '@/lib/complex';

interface MatrixViewProps {
  matrix: Matrix2;
  /** Cómo escribir cada entrada: decimales (formatComplex) o símbolos exactos (formatComplexExact). */
  format: (c: Complex) => string;
  /** Tamaño de letra y otros ajustes: el componente no fija el tamaño del texto. */
  className?: string;
}

/** Matriz 2×2 entre corchetes. La usan la matriz de densidad y las matrices de las compuertas. */
export function MatrixView({ matrix, format, className = '' }: MatrixViewProps) {
  const entries = [matrix[0][0], matrix[0][1], matrix[1][0], matrix[1][1]];
  return (
    <div className={`inline-flex items-stretch font-mono tabular-nums ${className}`}>
      <div className="w-1.5 rounded-l-sm border-y border-l border-border" aria-hidden="true" />
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 px-1.5 py-0.5">
        {entries.map((entry, index) => (
          <span key={index} className="whitespace-nowrap text-center">
            {format(entry)}
          </span>
        ))}
      </div>
      <div className="w-1.5 rounded-r-sm border-y border-r border-border" aria-hidden="true" />
    </div>
  );
}
