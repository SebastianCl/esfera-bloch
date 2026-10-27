import { Badge } from '@/components/ui/badge';
import { ket, type Notation } from '@/lib/notation';

interface AnglesSummaryProps {
  notation: Notation;
}

/**
 * Qué son θ y φ, la fórmula del estado y las coordenadas cartesianas. La
 * comparten la guía rápida y el capítulo 6 del curso; el color y el tamaño del
 * texto los pone quien la usa.
 */
export function AnglesSummary({ notation }: AnglesSummaryProps) {
  const u = ket('zero', notation);
  const d = ket('one', notation);

  return (
    <div className="space-y-2">
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
      <p>Las coordenadas cartesianas son x = sin θ cos φ, y = sin θ sin φ, z = cos θ.</p>
    </div>
  );
}
