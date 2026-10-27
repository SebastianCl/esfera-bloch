/**
 * Jerarquía de títulos compartida. Vive en lib/ y no en un componente por la
 * regla react-refresh/only-export-components.
 *
 * Laboratorio (tarjetas): h3 PANEL_TITLE una vez por tarjeta (el panel de
 * estado; en el derecho lo hacen las pestañas) → h4 SECTION_LABEL por sección
 * → h5 `text-sm font-medium` por subgrupo.
 *
 * Curso (/teoria, un documento): h1 el del header → h2 CHAPTER_TITLE por
 * capítulo → h3 SECTION_LABEL por sección → h4 `text-sm font-medium`, solo
 * debajo de un h3. KICKER es la línea pequeña sobre un título de capítulo
 * («Capítulo 3 · Lección 30») y la etiqueta de un aparte; no es un título.
 */
export const PANEL_TITLE = 'text-base font-semibold';
export const SECTION_LABEL = 'text-xs font-medium uppercase tracking-wider text-muted-foreground';
export const CHAPTER_TITLE = 'text-xl font-semibold tracking-tight';
export const KICKER = 'text-xs text-muted-foreground';
