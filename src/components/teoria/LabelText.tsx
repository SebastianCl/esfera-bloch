import type { Label } from '@/lib/course';
import { ket, type Notation } from '@/lib/notation';

interface LabelTextProps {
  parts: Label;
  notation: Notation;
}

/** Etiqueta de un botón o grupo: los kets por ket() y los números en monoespaciada, el resto en la fuente del texto. */
export function LabelText({ parts, notation }: LabelTextProps) {
  return (
    <>
      {parts.map((part, i) => {
        const mono = 'ket' in part || part.mono;
        const text = 'ket' in part ? ket(part.ket, notation) : part.text;
        return (
          <span key={i} className={mono ? 'font-mono tabular-nums' : undefined}>
            {i > 0 ? ' ' : ''}
            {text}
          </span>
        );
      })}
    </>
  );
}
