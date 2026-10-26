import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

/** Alterna entre el tema oscuro (por defecto) y el claro definido en index.css. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes resuelve el tema tras montar; hasta entonces no se sabe cuál mostrar
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isLight = mounted && resolvedTheme === 'light';
  const label = isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      title={label}
      aria-label={label}
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
