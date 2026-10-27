import type { ReactNode } from 'react';
import { KICKER } from '@/lib/styles';

interface CalloutProps {
  /** «Ojo», «Notación»… */
  label: string;
  children: ReactNode;
}

/** Aparte breve al margen del hilo: un aviso o una nota sobre la notación. */
export function Callout({ label, children }: CalloutProps) {
  return (
    <aside className="border-l-2 border-primary/50 pl-3 text-sm space-y-1">
      <p className={`${KICKER} font-medium`}>{label}</p>
      {children}
    </aside>
  );
}
