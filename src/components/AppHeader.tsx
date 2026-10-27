import { BookOpen, FlaskConical } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNotation } from '@/hooks/use-notation';
import { NOTATION_NAMES, NOTATIONS, type Notation } from '@/lib/notation';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  /** Frase bajo el título: cada página dice lo suyo. */
  subtitle: string;
}

// NavLink no va dentro de <Button asChild>: Slot convierte la className función
// en cadena. Se le aplican las clases del botón ghost directamente.
const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    buttonVariants({ variant: 'ghost', size: 'sm' }),
    isActive ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground',
  );

/** Cabecera común a las dos páginas: título, sección, notación y tema. */
export function AppHeader({ subtitle }: AppHeaderProps) {
  const { notation, setNotation } = useNotation();

  return (
    <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-quantum bg-clip-text text-transparent">
              Esfera de Bloch
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          {/* Solo lo global: sección de la app, notación y tema.
              Reiniciar y Aleatorio viven junto a la esfera de cada página. */}
          <div className="flex flex-wrap items-center gap-2">
            <nav aria-label="Secciones de la aplicación" className="flex items-center gap-1">
              <NavLink to="/" end className={navLinkClass}>
                <FlaskConical aria-hidden="true" />
                Laboratorio
              </NavLink>
              <NavLink to="/teoria" className={navLinkClass}>
                <BookOpen aria-hidden="true" />
                Teoría
              </NavLink>
            </nav>
            <Separator orientation="vertical" className="h-6" />
            <ToggleGroup
              type="single"
              size="sm"
              variant="outline"
              value={notation}
              onValueChange={(value) => value && setNotation(value as Notation)}
              aria-label="Notación de los estados"
            >
              {NOTATIONS.map((n) => (
                <ToggleGroupItem key={n} value={n} className="text-xs font-mono" title={NOTATION_NAMES[n]}>
                  {n === 'computacional' ? '|0⟩ |1⟩ |+⟩' : '|u⟩ |d⟩ |r⟩'}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
