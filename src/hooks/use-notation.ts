import { createContext, useContext } from 'react';
import { NOTATIONS, type Notation } from '@/lib/notation';

/**
 * La notación de los autoestados (computacional o curso) es global: la elige el
 * header y la leen las dos páginas. Vive en un contexto cuyo dueño es App.tsx,
 * que además la persiste en localStorage (como hace next-themes con el tema).
 * Este archivo no exporta componentes, así que react-refresh no se queja.
 */
export interface NotationContextValue {
  notation: Notation;
  setNotation: (notation: Notation) => void;
}

export const NotationContext = createContext<NotationContextValue | null>(null);

export const NOTATION_STORAGE_KEY = 'esfera-bloch-notation';

const DEFAULT_NOTATION: Notation = 'computacional';

/** Notación guardada en localStorage, validada contra NOTATIONS; computacional por defecto. */
export function readStoredNotation(): Notation {
  if (typeof window === 'undefined') return DEFAULT_NOTATION;
  try {
    const stored = window.localStorage.getItem(NOTATION_STORAGE_KEY);
    if (stored && (NOTATIONS as string[]).includes(stored)) return stored as Notation;
  } catch {
    // localStorage puede no estar disponible (modo privado, política del navegador)
  }
  return DEFAULT_NOTATION;
}

export function storeNotation(notation: Notation): void {
  try {
    window.localStorage.setItem(NOTATION_STORAGE_KEY, notation);
  } catch {
    // sin persistencia: la elección vale solo para esta sesión
  }
}

export function useNotation(): NotationContextValue {
  const value = useContext(NotationContext);
  if (!value) throw new Error('useNotation debe usarse dentro de NotationContext.Provider');
  return value;
}
