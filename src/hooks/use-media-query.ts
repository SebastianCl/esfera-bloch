import { useEffect, useState } from 'react';

/**
 * true cuando la media query se cumple. Empieza en false hasta que se evalúa en
 * el navegador, así que el primer render coincide con el de servidor o test.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Punto de corte `lg` de Tailwind: a partir de aquí la rejilla es de tres columnas. */
export const DESKTOP_QUERY = '(min-width: 1024px)';
/** Puntero grueso: dedo. Donde hay pellizco para acercar y no rueda. */
export const COARSE_POINTER_QUERY = '(pointer: coarse)';
