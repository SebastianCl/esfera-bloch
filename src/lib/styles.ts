/**
 * Jerarquía de títulos compartida por los tres paneles. Vive en lib/ y no en
 * un componente por la regla react-refresh/only-export-components.
 * - Título de panel: una vez por tarjeta (el panel de estado; en el derecho
 *   lo hacen las pestañas).
 * - Etiqueta de sección: mayúsculas pequeñas, como en un panel de instrumentos.
 */
export const PANEL_TITLE = 'text-base font-semibold';
export const SECTION_LABEL = 'text-xs font-medium uppercase tracking-wider text-muted-foreground';
