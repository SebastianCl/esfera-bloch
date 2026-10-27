import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { COARSE_POINTER_QUERY, useMediaQuery } from '@/hooks/use-media-query';
import { VIEW_MODES, type ViewMode } from '@/lib/modes';
import { cn } from '@/lib/utils';

interface ViewModeToggleProps {
  mode: ViewMode;
  /** Siempre changeMode del hook (proyecta al círculo al entrar en ese modo), nunca el setter crudo. */
  onChange: (mode: ViewMode) => void;
  /** Clases extra del texto de ayuda (el dock del curso lo oculta en pantallas estrechas). */
  descriptionClassName?: string;
}

/** Selector de modo de vista (esfera, polo, círculo) con su texto de ayuda. */
export function ViewModeToggle({ mode, onChange, descriptionClassName }: ViewModeToggleProps) {
  const coarsePointer = useMediaQuery(COARSE_POINTER_QUERY);
  const current = VIEW_MODES.find((m) => m.value === mode);
  const description = (coarsePointer && current?.touchDescription) || current?.description;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <ToggleGroup
        type="single"
        size="sm"
        variant="outline"
        value={mode}
        onValueChange={(value) => value && onChange(value as ViewMode)}
        aria-label="Modo de visualización"
      >
        {VIEW_MODES.map((m) => (
          <ToggleGroupItem key={m.value} value={m.value} className="text-xs" title={m.description}>
            {m.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <span className={cn('text-xs text-muted-foreground', descriptionClassName)}>{description}</span>
    </div>
  );
}
